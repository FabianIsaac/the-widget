import { Notice, Plugin, moment } from "obsidian";
import type { App } from "obsidian";
import type ObsidianWidgets from "src/main";
import type { SettingsInterface } from "src/types";

class ObsidianEngine {

    private static _instance: ObsidianEngine | null = null;

    private app: App;
    private plugin: ObsidianWidgets;
    public pluginName: string = "Obsidian Widgets";

    private constructor(app: App, plugin: ObsidianWidgets) {
        this.plugin = plugin;
        this.app = app;

        if (this.plugin) {
            this.pluginName = this.plugin.manifest?.name || this.pluginName;
        }
    }

    static async initialize(app: App, plugin: ObsidianWidgets): Promise<void> {
        if (!ObsidianEngine._instance) {
            ObsidianEngine._instance = new ObsidianEngine(app, plugin);
        }
        ObsidianEngine._instance.app = app;
        ObsidianEngine._instance.plugin = plugin;
    }

    static getInstance(): ObsidianEngine {
        if (!ObsidianEngine._instance) {
            throw new Error("Obsidian Widgets: ObsidianEngine not initialized. Call Initialize() first.");
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

        if (this.plugin && (this.plugin as any).settings) {
            return (this.plugin as any).settings;
        }
        this.message("Plugin or settings not available");

        throw new Error("Obsidian Widget: Plugin or settings not available");
    }

    public async saveSettings(settings: SettingsInterface): Promise<void> {
        if (this.plugin && typeof this.plugin.saveData === "function") {
            (this.plugin as any).settings = settings;
            await this.plugin.saveData(settings);
        }
    }

    public getDate(){
        return (moment as any)().format("YYYY-MM-DD");
    }

    public executeCommandById(commandId: string): void {
        // Intentar ejecutar mediante la app provista por el plugin
        try {
            // @ts-ignore
            if (this.app && this.app.commands && typeof this.app.commands.executeCommandById === 'function') {
                // @ts-ignore
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
