import { Setting } from "obsidian";
import ObsidianEngine from "src/application/obsidian-engine";


export class WeekSettings {

    constructor() { }

    public static create(element: HTMLElement): void {

        const obsidianEngine = ObsidianEngine.getInstance();

        new Setting(element).setName('Weekly settings').setHeading();
        new Setting(element)
            .setName('Template for weekly notes')
            .setDesc('Template to use when creating new weekly notes.')
            .addText((text) => text.setPlaceholder('Find template')
                .setValue('')
                .onChange(async (value) => {

                    obsidianEngine.getFileInVault(value);
                    
                })
            );
    }

}