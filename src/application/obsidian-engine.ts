import { Notice, Plugin, moment } from "obsidian";
import type { App } from "obsidian";
import type TheWidget from "src/main";
import type { SettingsInterface } from "src/types";

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

    public getDate(){
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

}

export default ObsidianEngine;
