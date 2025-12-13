import { requestUrl, Notice, moment } from "obsidian";
import ObsidianHelper from "./obsidian-engine";
import type { DailyQuoteInterface } from "src/types";


class QuoteHelper {

    private static _instance: QuoteHelper | null = null;

    private obsidianHelper: ObsidianHelper;

    // constructor privado: forzar uso de getInstance()
    private constructor() {
        this.obsidianHelper = ObsidianHelper.getInstance();
    }

    // Obtener la instancia singleton
    static getInstance(): QuoteHelper {
        if (!QuoteHelper._instance) {
            QuoteHelper._instance = new QuoteHelper();
        }
        return QuoteHelper._instance;
    }

    // Devuelve { quote, author, quoteDate } o null en caso de error
    async getDailyQuote(): Promise<{ quote: string; author: string; quoteDate: string } | null> {
        try {
            // requestUrl usa Electron net y evita 
            // restricciones CORS del renderer
            const res = await requestUrl({ url: "https://frasedeldia.azurewebsites.net/api/phrase", method: "GET" });

            // requestUrl suele exponer `text`; parseamos JSON de forma segura
            let data: any = null;
            if (res.json) {
                data = res.json;
            } else if (typeof res.text === "string" && res.text.length) {
                try {
                    data = JSON.parse(res.text);
                } catch (err) {
                    new Notice("QuoteHelper: failed to parse response text as JSON");
                    data = null;
                }
            }

            if (!data) {
                new Notice("QuoteHelper: no data returned from requestUrl");
                return null;
            }

            // La API devuelve { phrase, author } según tu ejemplo
            const quote = data.phrase ?? data.content ?? "";
            const author = data.author ?? data.autor ?? "";

            this.obsidianHelper
            return {
                quote,
                author,
                quoteDate: this.obsidianHelper.getDate(),
            };
        } catch (err) {
            // Manejo de errores y logging
            new Notice("QuoteHelper: failed to fetch daily quote");
            return null;
        }
    }

    // Nuevo método: obtiene la cita y la guarda en settings.quoteData usando plugin.saveData
    public async fetchAndStoreDailyQuote(): Promise<DailyQuoteInterface | null> {
        
        let settings = this.obsidianHelper.getSettings();

        if (!(settings?.dailyQuote && settings.quoteData === null || settings?.quoteData?.date === undefined || settings.quoteData.date !== (moment as any)().format("YYYY-MM-DD"))) {

            return settings.quoteData;
        }

        try {
            const q = await this.getDailyQuote();
            if (!q) return null;

            // Actualizar la estructura de settings
            settings.quoteData = {
                quote: q.quote,
                author: q.author,
                date: q.quoteDate,
            };

            // Guardar usando el plugin (persistir)
            await this.obsidianHelper.saveSettings(settings);

            return settings.quoteData;
        } catch (err) {
            new Notice(`${this.obsidianHelper.pluginName}: failed to fetch and store daily quote`);
            return null;
        }
    }
}

export default QuoteHelper;
