import { AbstractInputSuggest, App, type Command } from "obsidian";
import { ObsidianEngine } from "src/application";

export class CommandSuggest extends AbstractInputSuggest<string> {

    private commands: Command[];
    inputEl: HTMLInputElement;

    constructor(inputEl: HTMLInputElement) {
        super(ObsidianEngine.getInstance().app, inputEl);
        this.commands = ObsidianEngine.getInstance().getAllCommands();
        this.inputEl = inputEl;
    }

    getSuggestions(query: string): string[] {
        const q = query.toLowerCase();

        return this.commands
            .filter(command => command.id.toLowerCase()
            .includes(q))
            .map(command => command.id);
    }

    renderSuggestion(command: string, el: HTMLElement) {
        el.setText(command);
    }

    selectSuggestion(command: string) {
        this.inputEl.value = command;
        this.inputEl.dispatchEvent(new Event("input"));
        this.close();
    }
}
