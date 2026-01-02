import { App, FuzzySuggestModal } from "obsidian";

export default class FileSuggestModal extends FuzzySuggestModal<string> {
    fetchItems: (q: string) => Promise<string[]>;
    titleText: string;
    onChooseCb: (item: string | null) => void;

    constructor(app: App, fetchItems: (q: string) => Promise<string[]>, title: string, onChoose: (item: string | null) => void) {
        super(app);
        this.fetchItems = fetchItems;
        this.titleText = title;
        this.onChooseCb = onChoose;
    }

    async getItems(): Promise<string[]> {
        const q = this.inputEl?.value ?? "";
        return await this.fetchItems(q);
    }

    getItemText(item: string): string {
        return item;
    }

    onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
        this.onChooseCb(item);
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.createEl("div", { text: this.titleText }).addClass("modal-title");
        this.inputEl.placeholder = "Buscar...";
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
