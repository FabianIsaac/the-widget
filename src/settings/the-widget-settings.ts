import TheWidget from "src/main";
import { App, Notice, PluginSettingTab, Setting, TextComponent } from "obsidian";
import { DEFAULT_SETTINGS, type SettingsInterface, type ActionInterface } from "src/types";
import ObsidianEngine from "src/application/obsidian-engine";


export class TheWidgetSettingsTab extends PluginSettingTab {

    plugin: TheWidget;
    element: HTMLElement;
    settings: SettingsInterface;
    obsidianEngine: ObsidianEngine;

    constructor(app: App, plugin: TheWidget) {
        super(app, plugin);
        
        this.obsidianEngine = ObsidianEngine.getInstance();
        this.element = this.containerEl;
        this.plugin = plugin;
        this.settings = this.obsidianEngine.getSettings();
    }

    display(): void {
        this.element.empty();
        this.CreateHeader('General settings.');
        this.DailyNoteFormatSetting();
        this.CreateQuoteSettings();
        this.CommandForDailyNoteSetting();
        this.IconForWeeklyNoteSetting();
        this.CommandForWeeklyNoteSetting();
        this.CreateHeader('Settings for advanced widgets.');
        this.CreateDynamicActionSettings();
        this.AddActionSetting();
        this.CreateHeader('Helper to find command IDs.');
        this.CommandFinderSetting();
    }

    private async copyToClipboard(text: string): Promise<void> {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(text);
                return;
            } catch (e) {
                // continue to fallback below
            }
        }

        const ta = document.createElement('textarea') as HTMLTextAreaElement;
        ta.value = text;
        ta.setCssProps({ position: 'fixed', left: '-9999px', border: '1px solid yellow' });
        
        document.body.appendChild(ta);
        ta.focus();
        ta.select();

        // As `document.execCommand('copy')` is deprecated, instruct the user to copy manually if Clipboard API fails.
        new Notice('Clipboard API not available. The text has been selected — press Cmd/Ctrl+C to copy.');

        setTimeout(() => {
            try { document.body.removeChild(ta); } catch (e) { /* ignore */ }
        }, 2000);
    }

    private CommandFinderSetting(): Setting {
        
        let textComponent: TextComponent | null = null;

        return new Setting(this.element)
            .setName('Find command ID by name')
            .setDesc('Type the exact command name, then copy the ID or save it to a setting.')
            .addText(text => {
                text.setPlaceholder('Enter command name');
                textComponent = text;
            })
            .addButton(button => button
                .setButtonText('Find & copy ID')
                .onClick(async () => {
                    const commandName = textComponent?.getValue?.() || '';
                    if (!commandName) {
                        new Notice('Please enter a command name.');
                        return;
                    }

                    // @ts-expect-error - listCommands is present on app.commands
                    const command = this.app.commands.listCommands().find((c: CommandItem) => c.name === commandName);

                    if (command) {
                        await this.copyToClipboard(command.id);
                        new Notice(`ID "${command.id}" copied to clipboard.`);
                        try { textComponent?.setValue?.(''); } catch (e) { /* ignore */ }
                    } else {
                        new Notice('Command not found. Please check the exact name and try again.');
                    }
                }));
          
    }

    private CreateHeader(text: string): void {
        new Setting(this.element).setName(text).setHeading();
    }

    private DailyNoteFormatSetting(): Setting {
        const dateDesc = document.createDocumentFragment();

        dateDesc.appendText('The format string used to create daily note links. ');
        dateDesc.createEl('br');
        dateDesc.appendText('For a list of all available tokens, see the ');
        dateDesc.createEl('a', {
            text: 'Format reference',
            attr: { href: 'https://momentjs.com/docs/#/displaying/format/', target: '_blank' }
        });
        dateDesc.createEl('br');
        dateDesc.appendText('Your current syntax looks like this: ');
        const dateSampleEl = dateDesc.createEl('b', 'u-pop');

        return new Setting(this.element)
            .setName('Link format for daily notes')
            .setDesc(dateDesc)
            .addMomentFormat(momentFormat => momentFormat
                .setValue(this.settings.dailyNoteFormat)
                .setSampleEl(dateSampleEl)
                .setDefaultFormat(DEFAULT_SETTINGS.dailyNoteFormat)
                .onChange(async (value) => {
                    this.settings.dailyNoteFormat = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                }));
    }

    private CommandForDailyNoteSetting(): Setting {
        return new Setting(this.element)
            .setName('Command to execute daily note')
            .setDesc('The command that will be executed when clicking the button to open the daily note.')
            .addText((text) => text.setPlaceholder('Enter command ID')
                .setValue(this.settings.commandForDailyNote || '')
                .onChange(async (value) => {
                    this.settings.commandForDailyNote = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                })
            );
    }

    private CommandForWeeklyNoteSetting(): Setting {
        return new Setting(this.element)
            .setName('Command to execute weekly note')
            .setDesc('The command that will be executed when clicking the button to open the weekly note.')
            .addText((text) => text.setPlaceholder('Enter command ID')
                .setValue(this.settings.commandForWeeklyNote || '')
                .onChange(async (value) => {
                    this.settings.commandForWeeklyNote = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                })
            );
    }

    private IconForWeeklyNoteSetting(): Setting {
        return new Setting(this.element)
            .setName('Icon for weekly note button')
            .setDesc('The icon that will be displayed on the button to open the weekly note.')
            .addText((text) => text.setPlaceholder('Enter icon name')
                .setValue(this.settings.iconForWeeklyNote || '')
                .onChange(async (value) => {
                    this.settings.iconForWeeklyNote = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                })
            );
    }

    private AddActionSetting(): Setting {
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
        const dateSampleEl = dateDesc.createEl('b', 'u-pop');

        return new Setting(this.element)
            .setName('Action settings')
            .setDesc(dateDesc)
            
            .addButton(button => button
                .setButtonText('Add action')
                .onClick(() => {
                    this.settings.actions.push({ icon: 'carrot', command: 'my-command' });
                    this.display();
                })
            )

    }

    private CreateDynamicActionSettings(): void {
        this.settings.actions.forEach((action: ActionInterface, index: number) => {
            new Setting(this.element)
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
                .addText(text => text
                    .setPlaceholder('Command ID')
                    .setValue(action.command)
                    .onChange(async (value) => {
                        this.settings.actions[index].command = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    })
                )
                
                .addButton(button => button
                    .setButtonText('Remove')
                    .onClick(async () => {
                        this.settings.actions.splice(index, 1);
                        await this.obsidianEngine.saveSettings(this.settings);
                        this.display();
                    })
                );
        });
    }

    private CreateQuoteSettings(): void {
        new Setting(this.element)
            .setName('Use daily quote')
            .setDesc('Enable or disable the daily quote feature in the widget.')
            .addToggle(toggle => toggle
                .setValue(this.settings.dailyQuote ?? false)
                .onChange(async (value) => {
                    this.settings.dailyQuote = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                    this.display();
                })
            );
    }
}
