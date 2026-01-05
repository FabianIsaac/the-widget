import { Notice, TFile, moment } from "obsidian";
import type { App, Command } from "obsidian";
import type TheWidget from "src/main";
import type { SettingsInterface } from "src/types";

class ObsidianEngine {

    private static _instance: ObsidianEngine | null = null;

    public app: App;
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
        try {
            // @ts-expect-error - acceso a API interna de Obsidian
            if (this.app && this.app.commands && typeof this.app.commands.executeCommandById === 'function') {
                // @ts-expect-error - acceso a API interna de Obsidian
                this.app.commands.executeCommandById(commandId);
                return;
            }
        } catch (err) {
            
            console.error("The Widget: Error executing command in app.", err);
            this.message("Error executing command in app.");

            const event = new CustomEvent("obsidian-command", {
                detail: { commandId },
            });

            document.dispatchEvent(event);
        }
    }

    public async getTemplateContent(templatePath: string): Promise<string | null> {
        const { vault } = this.app;
        const templateAbstract = vault.getAbstractFileByPath(templatePath);

        if (!(templateAbstract instanceof TFile)) {
            this.message(`Template not found: ${templatePath}`);
            return null;
        }

        const templateContent = await vault.read(templateAbstract);

        return templateContent;
    }

    public async openOrCreateFromTemplate(targetPath: string, templatePath: string) {

        const { vault, workspace } = this.app;

        // 1. Obtener template y leer contenido del template
        const templateContent = await this.getTemplateContent(templatePath) ?? "";

        // 3. Comprobar si ya existe la nota destino
        const existing = vault.getAbstractFileByPath(targetPath);

        let file: TFile;
        if (existing instanceof TFile) {
            file = existing;

        } else {

            // Opcional: crear carpeta si no existe
            const lastSlash = targetPath.lastIndexOf("/");
            if (lastSlash !== -1) {
                const folderPath = targetPath.substring(0, lastSlash);
                if (!vault.getAbstractFileByPath(folderPath)) {
                    await vault.createFolder(folderPath);
                }
            }

            // 4. Crear nota con el contenido del template
            file = await vault.create(targetPath, templateContent);
        }

        // 5. Abrir la nota
        const leaf = workspace.getLeaf(false);
        await leaf.openFile(file);
    }

    public getAllCommands(): Command[] {
        // @ts-ignore si TypeScript se queja
        return this.app.commands.listCommands();
    }

}

export default ObsidianEngine;
