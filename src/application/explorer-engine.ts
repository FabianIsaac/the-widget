import type { App, TFile } from "obsidian";
import ObsidianEngine from "./obsidian-engine";
import QueryEngine from "./query-engine";

class ExplorerEngine {
    private static _instance: ExplorerEngine;
    private app: App;

    private constructor() {
        const obsidianEngine = ObsidianEngine.getInstance();
        this.app = obsidianEngine.getApp();
    }

    public static getInstance(): ExplorerEngine {
        if (!ExplorerEngine._instance) {
            ExplorerEngine._instance = new ExplorerEngine();
        }
        return ExplorerEngine._instance;
    }

    // Mantengo un método sincrónico simple por compatibilidad si lo necesitas:
    public getFiles(): TFile[] {
        return this.app.vault.getMarkdownFiles();
    }

    // Nuevo: búsqueda por query (asíncrono)
    public async getFilesByQuery(query: string): Promise<TFile[]> {
        // puedes pasar un subconjunto de archivos como tercer argumento si quieres limitar el scope
        const files = this.app.vault.getMarkdownFiles();
        return await QueryEngine.execute(query, this.app, files);
    }

    public getFilesInFolder(folderPath: string): TFile[] {
        const allFiles = this.app.vault.getMarkdownFiles();
        return allFiles.filter(file => file.path.startsWith(folderPath + '/'));
    }

    public getFolders() {
        return this.app.vault.getAllFolders();
    }
}

export default ExplorerEngine;