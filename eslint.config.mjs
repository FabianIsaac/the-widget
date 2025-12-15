import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // 1. Añade este bloque al principio para ignorar archivos globalmente
  {
    ignores: [
      "node_modules/",
      "main.js",
      "styles.css",
      "coverage/",
      "version-bump.mjs"
    ]
  },
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];