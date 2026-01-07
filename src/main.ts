import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, type SettingsInterface } from 'src/types';
import { mount, unmount } from 'svelte';
import { Bootstrap } from 'src/bootstrap';

import Basic from './presentation/widgets/Basic.widget.svelte';
import Advanced from 'src/presentation/widgets/Advanced.widget.svelte';
import Quote from 'src/presentation/widgets/Quote.widget.svelte';
import Weekly from 'src/presentation/widgets/Weekly.widget.svelte';
import Daily from './presentation/widgets/Daily.widget.svelte';

export default class TheWidget extends Plugin {

    settings: SettingsInterface = DEFAULT_SETTINGS;

    // Widgets
    basic: ReturnType<typeof Basic> | undefined;
    advanced: ReturnType<typeof Advanced> | undefined;
    quote: ReturnType<typeof Quote> | undefined;
    weekly: ReturnType<typeof Weekly> | undefined;
    daily: ReturnType<typeof Daily> | undefined;

    async onload() {

        await new Bootstrap(this, this.app).run();

        this.registerMarkdownCodeBlockProcessor('tw-basic', (_, el, _ctx) => {
            this.basic = mount(Basic, {
                target: el,
            });
        });

        this.registerMarkdownCodeBlockProcessor('tw-advanced', (_, el, _ctx) => {
            this.advanced = mount(Advanced, {
                target: el
            });
        });

        this.registerMarkdownCodeBlockProcessor('tw-daily', (query, el, _ctx) => {
            this.daily = mount(Daily, {
                target: el,
                props: {
                    
                }
            });
        });

        this.registerMarkdownCodeBlockProcessor('tw-weekly', (query, el, _ctx) => {
            this.weekly = mount(Weekly, {
                target: el,
                props: {
                    data: JSON.parse(query.trim() || "{}")
                }
            });
        });

        this.registerMarkdownCodeBlockProcessor('tw-quote', (_, el, _ctx) => {
            this.quote = mount(Quote, {
                target: el
            });
        });
    }

    onunload() {
        if (this.basic) {
            void unmount(this.basic);
        }

        if (this.advanced) {
            void unmount(this.advanced);
        }

        if (this.weekly) {
            void unmount(this.weekly);
        }

        if (this.quote) {
            void unmount(this.quote);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
