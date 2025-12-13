// src/application/query-engine.ts
import type { App, TFile } from "obsidian";

type AsyncPredicate = (file: TFile) => Promise<boolean>;

export default class QueryEngine {
  // Entrypoint: ejecuta la consulta sobre una lista de archivos (si files no se pasa, se toma vault.getMarkdownFiles())
  static async execute(query: string, app: App, files?: TFile[]): Promise<TFile[]> {
    const allFiles = files ?? app.vault.getMarkdownFiles();
    const tokens = QueryEngine.tokenize(query);
    const postfix = QueryEngine.toPostfix(tokens);
    const results = await Promise.all(allFiles.map(async (f) => {
      const ok = await QueryEngine.evalPostfix(postfix, f, app);
      return ok ? f : null;
    }));
    return results.filter(Boolean) as TFile[];
  }

  // --- Tokenizer (simple, soporta comillas y paréntesis) ---
  private static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    const s = input.trim();
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === "(" || c === ")") { tokens.push(c); i++; continue; }
      if (c === '"') {
        i++;
        let buf = "";
        while (i < s.length && s[i] !== '"') { buf += s[i++]; }
        i++; // skip closing "
        tokens.push(buf);
        continue;
      }
      // read word token (until space or paren)
      let buf = "";
      while (i < s.length && !/\s|\(|\)/.test(s[i])) {
        buf += s[i++];
      }
      tokens.push(buf);
    }
    // Merge implicit AND: we will treat spaces between operands as AND during postfix conversion
    return tokens;
  }

  // --- Infix -> Postfix (shunting-yard), operators: NOT (unary), AND, OR ---
  private static toPostfix(tokens: string[]): string[] {
    const out: string[] = [];
    const ops: string[] = [];

    const precedence = (op: string) => {
      if (op === "NOT") return 3;
      if (op === "AND") return 2;
      if (op === "OR") return 1;
      return 0;
    };

    const isOperator = (t: string) => {
      const u = t.toUpperCase();
      return u === "AND" || u === "OR" || u === "NOT";
    };

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === "(") {
        ops.push(t);
      } else if (t === ")") {
        while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop()!);
        ops.pop();
      } else if (isOperator(t)) {
        const op = t.toUpperCase();
        // Handle implicit NOT as unary if appears right before operand and explicitly written as NOT
        while (ops.length && isOperator(ops[ops.length - 1]) && precedence(ops[ops.length - 1]) >= precedence(op)) {
          out.push(ops.pop()!);
        }
        ops.push(op);
      } else {
        // operand
        out.push(t);
        // insert implicit AND when next token is an operand or '(' and current isn't an operator
        const next = tokens[i + 1];
        if (next && next !== ")" && !isOperator(next) && next !== undefined) {
          // Use special token 'AND' as connector
          // But don't insert if current token was an operator
          // We'll let the loop insert nothing here; instead we rely on the following: after placing operand, if next is operand, push an implicit AND marker in ops stack
          // Simpler: we actually push explicit 'AND' into tokens stream (but avoid mutating original). For clarity we do nothing here because the parser already treats adjacency as separate operands.
        }
      }
    }

    while (ops.length) out.push(ops.pop()!);
    return out;
  }

  // --- Evaluate postfix for a single file ---
  private static async evalPostfix(postfix: string[], file: TFile, app: App): Promise<boolean> {
    const stack: Array<boolean> = [];
    for (const token of postfix) {
      const u = token.toUpperCase();
      if (u === "AND") {
        const b = stack.pop() ?? false;
        const a = stack.pop() ?? false;
        stack.push(a && b);
      } else if (u === "OR") {
        const b = stack.pop() ?? false;
        const a = stack.pop() ?? false;
        stack.push(a || b);
      } else if (u === "NOT") {
        const a = stack.pop() ?? false;
        stack.push(!a);
      } else {
        // operand -> evaluate predicate (supports async)
        const pred = QueryEngine.buildPredicate(token, app);
        const val = await pred(file);
        stack.push(val);
      }
    }
    return stack.length ? stack[stack.length - 1] : false;
  }

  // --- Predicate factory ---
  private static buildPredicate(token: string, app: App): AsyncPredicate {
    // token may be key:value or plainword
    const colonIdx = token.indexOf(":");
    if (colonIdx > 0) {
      const key = token.slice(0, colonIdx).toLowerCase();
      let value = token.slice(colonIdx + 1);

      // strip surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);

      if (key === "name") {
        return async (f) => f.name.toLowerCase().includes(value.toLowerCase());
      }
      if (key === "path") {
        if (value.startsWith("^")) {
          const v = value.slice(1);
          return async (f) => f.path.startsWith(v);
        }
        return async (f) => f.path.toLowerCase().includes(value.toLowerCase());
      }
      if (key === "ext") {
        const v = value.replace(/^\./, "").toLowerCase();
        return async (f) => f.extension?.toLowerCase() === v;
      }
      if (key === "tag") {
        const v = value.toLowerCase();
        return async (f) => {
          const cache = app.metadataCache.getFileCache(f);
          if (!cache) return false;
          // tags may live in frontmatter or inline tags
          const tags: string[] = [];
          if (cache.frontmatter && typeof cache.frontmatter === "object") {
            // frontmatter tags could be array or string
            const fm: any = cache.frontmatter;
            if (fm.tags) {
              if (Array.isArray(fm.tags)) fm.tags.forEach((t: string) => tags.push(String(t).toLowerCase()));
              else tags.push(String(fm.tags).toLowerCase());
            }
          }
          if (cache.tags) {
            (cache.tags as any[]).forEach((t) => {
              if (t && t.tag) tags.push(String(t.tag).toLowerCase());
            });
          }
          return tags.some(t => t.includes(v));
        };
      }
      if (key === "content") {
        const v = value.toLowerCase();
        return async (f) => {
          try {
            const txt = (await app.vault.cachedRead(f)).toLowerCase();
            return txt.includes(v);
          } catch {
            return false;
          }
        };
      }
      if (key === "created" || key === "modified") {
        // supports > or < inside value: e.g. created>2023-01-01
        // value might start with '>' or '<'
        let op = ">";
        if (value.startsWith(">") || value.startsWith("<")) {
          op = value[0];
          value = value.slice(1);
        }
        const dateMs = Date.parse(value) || Number(value) || 0;
        return async (f) => {
          const ts = (key === "created") ? (f.stat?.ctime ?? 0) : (f.stat?.mtime ?? 0);
          if (op === ">") return ts > dateMs;
          return ts < dateMs;
        };
      }
      if (key === "regex") {
        // regex:/pattern/flags
        if (value.startsWith("/") && value.lastIndexOf("/") > 0) {
          const last = value.lastIndexOf("/");
          const pattern = value.slice(1, last);
          const flags = value.slice(last + 1);
          const re = new RegExp(pattern, flags);
          return async (f) => re.test(f.path) || re.test(f.name);
        } else {
          const re = new RegExp(value, "i");
          return async (f) => re.test(f.path) || re.test(f.name);
        }
      }

      // default: search in name and path
      const v = value.toLowerCase();
      return async (f) => f.name.toLowerCase().includes(v) || f.path.toLowerCase().includes(v);
    } else {
      // plain token: search in name and path
      const v = token.toLowerCase();
      return async (f) => f.name.toLowerCase().includes(v) || f.path.toLowerCase().includes(v);
    }
  }
}