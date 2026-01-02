import { requestUrl, moment } from "obsidian";
import ObsidianEngine from "./obsidian-engine";
import type { DailyQuoteInterface } from "src/types";

class QuoteHelper {
    private static _instance: QuoteHelper;
    private obsidianEngine = ObsidianEngine.getInstance();

    private constructor() {}

    static getInstance(): QuoteHelper {
        return (this._instance ??= new QuoteHelper());
    }

    async fetchAndStoreDailyQuote(): Promise<DailyQuoteInterface | null> {
        const settings = this.obsidianEngine.getSettings();
        const today = moment().format("YYYY-MM-DD");

        if (settings.quoteData?.date === today) {

            return settings.quoteData;
        }

        if (!settings.dailyQuote) {

            return settings.quoteData ?? null;
        }

        try {
            const res = await requestUrl({ url: "https://frasedeldia.azurewebsites.net/api/phrase" });
            const data = res.json ?? (res.text ? JSON.parse(res.text) : null);
            
            if (!data) {

                return null;
            }

            settings.quoteData = {
                quote: data.phrase ?? data.content ?? "",
                author: data.author ?? data.autor ?? "",
                date: today,
            };

            await this.obsidianEngine.saveSettings(settings);

            return settings.quoteData;
        } catch {

            this.obsidianEngine.message("Error fetching quote");
            return null;
        }
    }
}

export default QuoteHelper;
