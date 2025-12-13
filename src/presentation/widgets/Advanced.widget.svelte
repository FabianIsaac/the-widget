<script lang="ts">
    import { Notice, setIcon } from "obsidian";
    import QuoteHelper from "src/application/quote-helper";
    import { onMount, tick } from "svelte";
    import type { ActionIconInterface, DailyQuoteInterface } from "src/types";
    import ObsidianEngine from "src/application/obsidian-engine";
    import Dot from "../components/Dot.component.svelte";
    import Journal from "../components/Journal.component.svelte";
    import Quote from "../components/Quote.component.svelte";

    const quoteHelper: QuoteHelper = QuoteHelper.getInstance();
    const obsidianEngine = ObsidianEngine.getInstance();

    let actionIcons: ActionIconInterface[] =
        obsidianEngine.getSettings()?.actions.map((action) => ({
            iconEl: null,
            command: action.command,
            iconName: action.icon || "question",
            tooltip: action.tooltip || "No tooltip",
        })) || [];

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
        await tick();

        if (obsidianEngine.getSettings().dailyQuote) {
            await getDailyQuote();
        }

        actionIcons.forEach((action) => {
            action.iconEl && setIcon(action.iconEl, action.iconName);
        });
    });
</script>

<div class="ow-widget-card">
    {#if actionIcons.length > 0}
        <div class="ow-flex-row-center ow-p-2 ow-px-4 ow-gap-2">
            {#each actionIcons as action}
                <button
                    class="ow-simply-link-button"
                    type="button"
                    on:click={() =>
                        obsidianEngine.executeCommandById(action.command)}
                    aria-label={action.tooltip}
                >
                    <div class="icon-button" bind:this={action.iconEl}></div>
                </button>
            {/each}
        </div>
        <div class="ow-separator"></div>
    {/if}

    <div class="ow-p-4 ow-space-y-4">
        <div class="col">
            <div class="ow-flex-row-center ow-gap-4">
                <Dot />
                <Journal />
            </div>

            {#if obsidianEngine.getSettings().dailyQuote}
                <div class="ow-small-quote ow-ml-7">
                    <Quote className="ow-small-quote" />
                </div>
            {/if}
        </div>
    </div>
</div>
