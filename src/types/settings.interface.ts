import type { ActionInterface } from "./action.interface";
import type { DailyQuoteInterface } from "./daily-quote.interface";
import type { WeekPropsSettingsInterface } from "./week-props-settings.interface";

export interface SettingsInterface {
    dateDisplayFormat: string;
    commandForDailyNote?: string;
    iconForWeeklyNote: string;
    commandForWeeklyNote?: string;
    actions: ActionInterface[];
    dailyQuote?: boolean;
    quoteData?: DailyQuoteInterface;
    dailyNoteFolder?: string;
    dailyNoteTemplatePath?: string;
    weekly: WeekPropsSettingsInterface;
}


export const DEFAULT_SETTINGS: SettingsInterface = {
    dateDisplayFormat: 'dddd DD, MMMM',
    commandForDailyNote: 'periodic-notes:open-daily-note',
    iconForWeeklyNote: 'calendar-week',
    commandForWeeklyNote: 'periodic-notes:open-weekly-note',
    actions: [],
    dailyQuote: true,
    quoteData: {
        quote: "",
        author: "",
        date: ""
    },
    dailyNoteFolder: '50_DIARIO',
    dailyNoteTemplatePath: '',
    weekly: {
        week: 1,
        year: 2024,
        folderPath: '50_DIARIO',
        notesPath: "YYYY/MMMM/YYYY-MM-DD"
    }
}
