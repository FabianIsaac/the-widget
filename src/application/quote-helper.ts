import { requestUrl, moment } from "obsidian";
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
            let data: { phrase?: string; author?: string; content?: string; autor?: string } | null = null;
            if (res.json) {
                data = res.json;
            } else if (typeof res.text === "string" && res.text.length) {
                try {
                    data = JSON.parse(res.text);
                } catch (err) {
                    this.obsidianHelper.message("Failed to parse response text as json.");
                    data = null;
                }
            }

            if (!data) {
                this.obsidianHelper.message("No data returned from quote api.");
                return null;
            }

            // La API devuelve { phrase, author } según tu ejemplo
            const quote = data.phrase ?? data.content ?? "";
            const author = data.author ?? data.autor ?? "";

            return {
                quote,
                author,
                quoteDate: this.obsidianHelper.getDate(),
            };
        } catch (err) {
            // Manejo de errores y logging
            this.obsidianHelper.message("Failed to fetch daily quote");
            return null;
        }
    }

    // Nuevo método: obtiene la cita y la guarda en settings.quoteData usando plugin.saveData
    public async fetchAndStoreDailyQuote(): Promise<DailyQuoteInterface | null> {
        
        const settings = this.obsidianHelper.getSettings();

        if (!(settings?.dailyQuote && settings.quoteData === null || settings?.quoteData?.date === undefined || settings.quoteData.date !== moment().format("YYYY-MM-DD"))) {

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
            this.obsidianHelper.message(`Failed to fetch and store daily quote`);
            return null;
        }
    }
}

export default QuoteHelper;
