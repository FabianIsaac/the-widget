import { Setting, SettingGroup } from "obsidian";
import { ObsidianEngine } from "src/application";
import type TheWidget from "src/main";
import { DEFAULT_SETTINGS, type SettingsInterface } from "src/types";
import { CommandSuggest } from "./suggestions/command.suggestion";


export class GeneralSettings {

    plugin: TheWidget;
    element: HTMLElement;
    settings: SettingsInterface;
    obsidianEngine: ObsidianEngine;

    constructor(element: HTMLElement) {
        this.obsidianEngine = ObsidianEngine.getInstance();
        this.element = element;
        this.settings = this.obsidianEngine.getSettings();
    }

    public AddSettings(element: HTMLElement): void {

        let group = new SettingGroup(element)
            .setHeading('Configuraciones generales');

        this.DateDisplayFormatSetting(group);
        this.CommandForDailyNoteSetting(group);
        this.CommandForWeeklyNoteSetting(group);
        this.IconForWeeklyNoteSetting(group);
        this.CreateQuoteSettings(group);

        let dailyNoteGroup = new SettingGroup(element)
            .setHeading("Configuraciones para crear notas diarias");

        this.DailyNoteForderSetting(dailyNoteGroup);
        this.FolderPathSetting(dailyNoteGroup);
        this.TemplatePathSetting(dailyNoteGroup);
    }


    private DateDisplayFormatSetting(group: SettingGroup): void {
        const dateDesc = document.createDocumentFragment();
        dateDesc.appendText('Texto para mostrar la fecha en los widgets que enlazan a la nota diaria.');
        dateDesc.createEl('br');
        dateDesc.appendText('Para una lista de todos los tokens disponibles, consulta la ');
        dateDesc.createEl('a', {
            text: 'Referencia de formato',
            attr: { href: 'https://momentjs.com/docs/#/displaying/format/', target: '_blank' }
        });
        dateDesc.createEl('br');
        dateDesc.appendText('Tu sintaxis actual se ve así: ');
        const dateSampleEl = dateDesc.createEl('b', 'u-pop');

        group.addSetting(settings => settings
            .setName('Formato a mostrar en los widgets que enlazan a la nota diaria')
            .setDesc(dateDesc)
            .addMomentFormat(momentFormat => momentFormat
                .setValue(this.settings.dateDisplayFormat)
                .setSampleEl(dateSampleEl)
                .setDefaultFormat(DEFAULT_SETTINGS.dateDisplayFormat)
                .onChange(async (value) => {
                    this.settings.dateDisplayFormat = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                }))
        );


    }

    private CommandForDailyNoteSetting(group: SettingGroup): void {
        group.addSetting(setting => setting
            .setName('Comando para abrir la nota diaria')
            .setDesc('El comando que ejecutará el widget básico y el avanzado para abrir la nota diaria.')
            .addSearch(search => {
                search.setValue(this.settings.commandForDailyNote || '')
                    .setPlaceholder('Search for a command id')
                    .onChange(async (value) => {
                        this.settings.commandForDailyNote = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    })
                new CommandSuggest(search.inputEl);
            }));
    }

    private IconForWeeklyNoteSetting(group: SettingGroup): void {
        group.addSetting(setting => setting
            .setName('Icono para el boton de nota semanal')
            .setDesc('El icono que se mostrará en el botón para abrir la nota semanal en el widget básico y avanzado.')
            .addText((text) => text.setPlaceholder('Ingrese el nombre del icono')
                .setValue(this.settings.iconForWeeklyNote || '')
                .onChange(async (value) => {
                    this.settings.iconForWeeklyNote = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                })
            ));
    }

    private CommandForWeeklyNoteSetting(group: SettingGroup): void {
        group.addSetting(setting => setting
            .setName('Comando para abrir la nota semanal')
            .setDesc('El comando que ejecutará el widget básico y el avanzado para abrir la nota semanal.')
            .addSearch(search => {
                search.setValue(this.settings.commandForWeeklyNote || '')
                    .setPlaceholder('Search for a command id')
                    .onChange(async (value) => {
                        this.settings.commandForWeeklyNote = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    })
                new CommandSuggest(search.inputEl);
            }));
    }

    private CreateQuoteSettings(group: SettingGroup): void {
        group.addSetting(setting => setting
            .setName('Usar cita diaria')
            .setDesc('Habilitar o deshabilitar la función de cita diaria en los widgets básico y avanzado.')
            .addToggle(toggle => toggle
                .setValue(this.settings.dailyQuote ?? false)
                .onChange(async (value) => {
                    this.settings.dailyQuote = value;
                    await this.obsidianEngine.saveSettings(this.settings);
                })
            ));
    }

    private DailyNoteForderSetting(group: SettingGroup): void {
        const dateDesc = document.createDocumentFragment();

        dateDesc.appendText('Formato de la ruta donde se almacenan las notas diarias.');
        dateDesc.createEl('br');
        dateDesc.appendText('Para una lista de todos los tokens disponibles, consulta la ');
        dateDesc.createEl('a', {
            text: 'Referencia de formato',
            attr: { href: 'https://momentjs.com/docs/#/displaying/format/', target: '_blank' }
        });
        dateDesc.createEl('br');
        dateDesc.appendText('Tu sintaxis actual se ve así: ');
        const dateSampleEl = dateDesc.createEl('b', 'u-pop');


        group.addSetting(settings => settings
            .setName('Formato')
            .setDesc(dateDesc)
            .addMomentFormat(momentFormat => momentFormat
                .setValue(this.settings.weekly.notesPath || 'YYYY/MMMM/YYYY-MM-DD')
                .setSampleEl(dateSampleEl)
                .setDefaultFormat(DEFAULT_SETTINGS.weekly.notesPath || 'YYYY/MMMM/YYYY-MM-DD')
                .onChange(
                    async (value) => {
                        this.settings.weekly.notesPath = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    }
                )
            ));
    }

    private FolderPathSetting(group: SettingGroup): void {
        group.addSetting(setting => setting
            .setName('Carpeta de notas diarias')
            .setDesc('La ruta de la carpeta donde se almacenan las notas diarias.')
            .addText(text => text
                .setPlaceholder('Ingrese la ruta para las notas diarias')
                .setValue(this.settings.dailyNoteFolder || '')
                .onChange(
                    async (value) => {
                        this.settings.weekly.notesPath = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    }
                )
            ));
    }

    private TemplatePathSetting(group: SettingGroup): void {
        group.addSetting(setting => setting
            .setName('Ruta de la plantilla para notas diarias')
            .setDesc('Plantilla que se utilizará para crear la nota diaria desde el widget semanal')
            .addText(text => text
                .setPlaceholder('Ingrese la ruta para la plantilla de notas diarias')
                .setValue(this.settings.dailyNoteTemplatePath || '')
                .onChange(
                    async (value) => {
                        this.settings.dailyNoteTemplatePath = value;
                        await this.obsidianEngine.saveSettings(this.settings);
                    }
                )
            ));
    }
}
