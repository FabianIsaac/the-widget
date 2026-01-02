<script lang="ts">
    import { onMount } from "svelte";
    import { moment, setIcon } from "obsidian";
    import ObsidianEngine from "src/application/obsidian-engine";
    const obsidianEngine = ObsidianEngine.getInstance();
    const settings = obsidianEngine.getSettings();

    let iconEl: HTMLDivElement;

    onMount(async () => {
        if (iconEl) {
            setIcon(iconEl, settings.iconForWeeklyNote || "calendar-week");
        }
    });

    $: computedText = settings ? moment().format(settings.dateDisplayFormat) : "";
</script>

<div class="ow-flex-row-center ow-gap-3">
    <button
        class="ow-simply-link-button"
        on:click={() =>
            obsidianEngine.executeCommandById(settings.commandForDailyNote!)}
        aria-label="Abrir nota diaria"
    >
        {computedText}
    </button>
    <button
        class="ow-simply-link-button"
        type="button"
        on:click={() =>
            obsidianEngine.executeCommandById(settings.commandForWeeklyNote!)}
        aria-label="Abrir nota semanal"
    >
        <div bind:this={iconEl} class="icon-button"></div>
    </button>
</div>
