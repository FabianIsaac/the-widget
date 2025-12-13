import type { ActionInterface } from "./action.interface";
import type { DailyQuoteInterface } from "./daily-quote.interface";

export interface SettingsInterface {
    dailyNoteFormat: string;
    commandForDailyNote?: string;
    iconForWeeklyNote: string;
    commandForWeeklyNote?: string;
    actions: ActionInterface[];
    dailyQuote?: boolean;
    quoteData?: DailyQuoteInterface;
}


export const DEFAULT_SETTINGS: SettingsInterface = {
    dailyNoteFormat: 'dddd DD, MMMM',
    commandForDailyNote: 'periodic-notes:open-daily-note',
    iconForWeeklyNote: 'calendar-week',
    commandForWeeklyNote: 'periodic-notes:open-weekly-note',
    actions: [],
    // Configuración por defecto para la cita diaria
    dailyQuote: true,
    quoteData: {
        quote: "",
        author: "",
        date: ""
    }
}
