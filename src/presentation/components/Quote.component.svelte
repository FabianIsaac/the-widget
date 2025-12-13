<script lang="ts">
    import { Notice } from "obsidian";
    import QuoteHelper from "src/application/quote-helper";
    import { onMount } from "svelte";
    import type { DailyQuoteInterface } from "src/types";
    import ObsidianEngine from "src/application/obsidian-engine";

    const quoteHelper: QuoteHelper = QuoteHelper.getInstance();
    const obsidianEngine = ObsidianEngine.getInstance();

    // Optional external class to apply to the root container
    export let className: string = "";

    let dailyQuote: DailyQuoteInterface | null =
        obsidianEngine.getSettings().quoteData || null;

    let loadingQuote = false;
    const getDailyQuote = async () => {
        loadingQuote = true;
        try {
            dailyQuote = await quoteHelper.fetchAndStoreDailyQuote();
        } catch (err) {
            new Notice("Error fetching daily quote:");
        } finally {
            loadingQuote = false;
        }
    };

    onMount(async () => {
        await getDailyQuote();
    });
</script>

<div>
    {#if loadingQuote}
        <p>Cargando cita...</p>
    {:else if dailyQuote}
        <blockquote class="ow-blockquote {className}">
            <p class="ow-quote">{dailyQuote.quote}</p>
            <p class="ow-author">
                {dailyQuote.author || "Autor desconocido"}
            </p>
        </blockquote>
    {:else}
        <p>No se encontró la cita del día.</p>
    {/if}
</div>
