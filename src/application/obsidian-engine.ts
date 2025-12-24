import { Notice, Plugin, TFile, moment } from "obsidian";
import type { App } from "obsidian";
import type TheWidget from "src/main";
import type { SettingsInterface } from "src/types";
import FileSuggestModal from "src/ui/file-suggest";

class ObsidianEngine {

    private static _instance: ObsidianEngine | null = null;

    private app: App;
    private plugin: TheWidget;
    public pluginName: string = "The Widget";

    private constructor(app: App, plugin: TheWidget) {
        this.plugin = plugin;
        this.app = app;

        if (this.plugin) {
            this.pluginName = this.plugin.manifest?.name || this.pluginName;
        }
    }

    static initialize(app: App, plugin: TheWidget): void {
        if (!ObsidianEngine._instance) {
            ObsidianEngine._instance = new ObsidianEngine(app, plugin);
        }
        ObsidianEngine._instance.app = app;
        ObsidianEngine._instance.plugin = plugin;
    }

    static getInstance(): ObsidianEngine {
        if (!ObsidianEngine._instance) {
            throw new Error("The Widget: ObsidianEngine not initialized. Call Initialize() first.");
        }

        return ObsidianEngine._instance;
    }

    public message(message: string, timeout: number = 4000): void {
        new Notice(`${this.pluginName}: ${message}`, timeout);
    }

    public getPlugin(): Plugin {
        return this.plugin;
    }

    public getApp(): App {
        return this.app;
    }

    public getSettings(): SettingsInterface {

        if (this.plugin && this.plugin.settings) {
            return this.plugin.settings;
        }
        this.message("Plugin or settings not available");

        throw new Error("The Widget: Plugin or settings not available");
    }

    public async saveSettings(settings: SettingsInterface): Promise<void> {
        if (this.plugin && typeof this.plugin.saveData === "function") {
            this.plugin.settings = settings;
            await this.plugin.saveData(settings);
        }
    }

    public getDate() {
        return moment().format("YYYY-MM-DD");
    }

    public executeCommandById(commandId: string): void {
        // Intentar ejecutar mediante la app provista por el plugin
        try {
            // @ts-expect-error - acceso a API interna de Obsidian
            if (this.app && this.app.commands && typeof this.app.commands.executeCommandById === 'function') {
                // @ts-expect-error - acceso a API interna de Obsidian
                this.app.commands.executeCommandById(commandId);
                return;
            }
        } catch (err) {
            // Error al ejecutar en app: registrar y usar fallback
            this.message("Error executing command in app.");

            const event = new CustomEvent("obsidian-command", {
                detail: { commandId },
            });

            document.dispatchEvent(event);
        }
    }

    public async openLink(url: string, newTab: boolean = true): Promise<void> {
        await this.app.workspace.openLinkText(url, "", newTab);
    }

    public async openFileByPath(filePath: string, newTab: boolean = true): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
            const leaf = this.app.workspace.getLeaf(newTab); // false = pestaña actual
            await leaf.openFile(file); // abre la nota
        }
    }

    public async openOrCreateFromTemplate(
        targetPath: string,      // "Carpeta/Nota.md"
        templatePath: string     // "Templates/MiTemplate.md"
    ) {
        const abstract = this.app.vault.getAbstractFileByPath(targetPath);

        let file: TFile;

        if (abstract instanceof TFile) {
            // Ya existe: usar la nota existente
            file = abstract;
        } else {
            // No existe: crear desde template
            const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
            if (!(templateFile instanceof TFile)) {
                new Notice("Template no encontrado");
                return;
            }

            const templateContent = await this.app.vault.read(templateFile);
            file = await this.app.vault.create(targetPath, templateContent);
        }

        const leaf = this.app.workspace.getLeaf(false);
        await leaf.openFile(file);
    }

    public consoleApp(): void {
        console.log(this.app);
    }

    public getFileInVault(filePath: string): void {

        const allFiles = this.app.vault.getFiles();
        const templates = allFiles.filter(f => f.path.startsWith(filePath));


        console.log(templates);
    }

    public async searchFiles(query: string, folderPrefix?: string, limit: number = 10): Promise<string[]> {
        const q = (query || "").toLowerCase();
        const allFiles = this.app.vault.getFiles();

        let candidates = allFiles.filter(f => {
            if (folderPrefix && !f.path.startsWith(folderPrefix)) return false;
            const name = f.name.toLowerCase();
            const path = f.path.toLowerCase();
            return q === "" || name.includes(q) || path.includes(q);
        });

        // Orden simple: aquellos con índice más bajo (startsWith) antes
        candidates.sort((a, b) => {
            const ai = a.path.toLowerCase().indexOf(q);
            const bi = b.path.toLowerCase().indexOf(q);
            return ai - bi;
        });

        return candidates.slice(0, limit).map(f => f.path);
    }

    public async pickFile(title: string = "Select file", folderPrefix?: string, limit: number = 50): Promise<string | null> {
        return new Promise(resolve => {
            const provider = async (q: string) => await this.searchFiles(q, folderPrefix, limit);
            const modal = new FileSuggestModal(this.app, provider, title, (result: string | null) => {
                resolve(result);
            });
            modal.open();
        });
    }
}

export default ObsidianEngine;
