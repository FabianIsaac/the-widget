import type ObsidianWidgets from "src/main";
import type { App } from "obsidian";
import { ObsidianEngine, QuoteHelper } from "./application";
import { ObsidianWidgetSettingsTab } from "./settings/obsidian-widgets-settings";

export class Bootstrap  {

    constructor(
		private plugin: ObsidianWidgets,
        private app: App
    ) {
        // Empty constructor or initialization if needed
    }

    async run(): Promise<void> {
        await this.plugin.loadSettings();
        
        await ObsidianEngine.initialize(this.app, this.plugin);
        
        
        await this.loadDailyQuote();

        this.plugin.addSettingTab(new ObsidianWidgetSettingsTab(this.app, this.plugin));
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