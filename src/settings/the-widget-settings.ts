import TheWidget from "src/main";
import { App, PluginSettingTab, SettingGroup } from "obsidian";
import { type SettingsInterface, type ActionInterface } from "src/types";
import ObsidianEngine from "src/application/obsidian-engine";
import { GeneralSettings } from "./general-settings";
import { CommandSuggest } from "./suggestions/command.suggestion";


export class TheWidgetSettingsTab extends PluginSettingTab {

    plugin: TheWidget;
    element: HTMLElement;
    settings: SettingsInterface;
    obsidianEngine: ObsidianEngine;

    generalSettings: GeneralSettings;

    constructor(app: App, plugin: TheWidget) {
        super(app, plugin);

        this.obsidianEngine = ObsidianEngine.getInstance();
        this.element = this.containerEl;
        this.settings = this.obsidianEngine.getSettings();
        this.generalSettings = new GeneralSettings(this.element);
    }

    display(): void {
        this.element.empty();

        this.generalSettings.AddSettings(this.element);

        let group = new SettingGroup(this.element)
            .setHeading('Settings for advanced widgets');


        this.CreateDynamicActionSettings(group);
        this.AddActionSetting(group);
    }

    private AddActionSetting(group: SettingGroup): void {
        const dateDesc = document.createDocumentFragment();

        dateDesc.appendText('Add a new action with an icon and command to be used in the widget.');
        dateDesc.createEl('br');
        dateDesc.appendText('For a list of all available icons, see the ');
        dateDesc.createEl('a', {
            text: 'Icon reference',
            attr: { href: 'https://lucide.dev/icons', target: '_blank' }
        });
        dateDesc.createEl('br');
        dateDesc.appendText('Your current syntax looks like this: ');

        void group.addSetting(setting => setting
            .setName('Action settings')
            .setDesc(dateDesc)
            .addButton(button => button
                .setIcon('plus')
                
                .onClick(() => {
                    this.settings.actions.push({ icon: 'carrot', command: 'my-command' });
                    this.display();
                })
            ));
    }

    private CreateDynamicActionSettings(group: SettingGroup): void {
        this.settings.actions.forEach((action: ActionInterface, index: number) => {
            void group.addSetting(setting => setting
                .setName(`Action ${index + 1}`)
                .addText(text => text
                    .setPlaceholder('Tooltip (optional)')
                    .setValue(action.tooltip ?? '')
                    .onChange(async (value) => {
                        this.settings.actions[index].tooltip = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    })
                )
                .addText(text => text
                    .setPlaceholder('Icon name')
                    .setValue(action.icon)
                    .onChange(async (value) => {
                        this.settings.actions[index].icon = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    })
                )
                .addSearch(search => {
                    search.setValue(action.command)
                        .setPlaceholder('Search for a command ID')
                        .onChange(async (value) => {
                            this.settings.actions[index].command = value;
                            await this.obsidianEngine.saveSettings(this.settings);
                        })
                    new CommandSuggest(search.inputEl);
                })
                .addButton(button => button
                    .setIcon('trash')
                    .onClick(async () => {
                        this.settings.actions.splice(index, 1);
                        await this.obsidianEngine.saveSettings(this.settings);
                        this.display();
                    })
                ))
        });
    }
}
