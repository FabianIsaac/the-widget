import type TheWidget from "src/main";
import type { App } from "obsidian";
import { ObsidianEngine, QuoteHelper } from "./application";
import { TheWidgetSettingsTab } from "./settings/the-widget-settings";

export class Bootstrap  {

    constructor(
        private plugin: TheWidget,
        private app: App
    ) {
        // Empty constructor or initialization if needed
    }

    async run(): Promise<void> {
        await this.plugin.loadSettings();
        
        ObsidianEngine.initialize(this.app, this.plugin);
        
        await this.loadDailyQuote();

        this.plugin.addSettingTab(new TheWidgetSettingsTab(this.app, this.plugin));
    }


    private async loadDailyQuote(): Promise<void> {
        if (this.plugin.settings?.dailyQuote) {
            try {
                await QuoteHelper.getInstance().fetchAndStoreDailyQuote();
            } catch (err) {
                ObsidianEngine.getInstance().message("Failed to fetch daily quote on load.");
            }
        }        
    }

}