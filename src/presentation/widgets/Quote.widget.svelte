<script lang="ts">
    import { Notice } from "obsidian";
    import QuoteHelper from "src/application/quote-helper";
    import { onMount } from "svelte";
    import type { DailyQuoteInterface } from "src/types";
    import ObsidianEngine from "src/application/obsidian-engine";
    import Quote from "../components/Quote.component.svelte";

    const quoteHelper: QuoteHelper = QuoteHelper.getInstance();
    const obsidianEngine = ObsidianEngine.getInstance();

    let dailyQuote: DailyQuoteInterface | null =
        obsidianEngine.getSettings().quoteData || null;

    let loadingQuote = false;

    onMount(async () => {
        await getDailyQuote();
    });

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
</script>

<div>
    <Quote />
</div>
