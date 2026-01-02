import { Setting, SettingGroup } from "obsidian";
import ObsidianEngine from "src/application/obsidian-engine";
import type TheWidget from "src/main";
import { type SettingsInterface } from "src/types";
import { CommandSuggest } from "./suggestions/command.suggestion";

export class WeekSettings {

    plugin: TheWidget;
    element: HTMLElement;
    settings: SettingsInterface;
    obsidianEngine: ObsidianEngine;

    constructor(element: HTMLElement) {
        this.obsidianEngine = ObsidianEngine.getInstance();
        this.element = element;
        this.settings = this.obsidianEngine.getSettings();
    }

    public showSettings(element: HTMLElement): void {

       

    }
}
