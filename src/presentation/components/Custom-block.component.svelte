<script lang="ts">
    import { setIcon } from "obsidian";
    import type { CustomWidgetInterface } from "src/types/custom-widget.interface";
    import { onMount } from "svelte";

    // The component expects a single prop `widget` matching the interface
    export let widget: CustomWidgetInterface | null = null;

    let iconEl: HTMLDivElement;

    onMount(async () => {
        if (iconEl) {
            setIcon(iconEl, widget?.icon || "calendar-week");
            iconEl.children[0].classList.add(
                "ow-w-10",
                "ow-h-10",
                "ow-flex-row-center",
                "ow-justify-center",
            );
        }
    });

    // Map widget.size to grid column span (grid with 4 columns)
    let spanClass = "ow-col-span-1";
    switch (widget?.size) {
        case "small":
            spanClass = "ow-col-span-1";
            break;

        case "medium":
            spanClass = "ow-col-span-2";
            break;

        case "large":
            spanClass = "ow-col-span-3";
            break;

        case "full":
            spanClass = "ow-col-span-4";
            break;

        default:
            spanClass = "ow-col-span-1";
    }
</script>

<article class="{spanClass} ow-relative ow-overflow-hidden ow-p-1 ow-h-full">
    {#if widget}
        <div class="ow-custom-block ow-h-full ow-flex-col ow-justify-end">
            {#if widget.icon}
                <!-- icon placeholder: plugin can set icons with setIcon if desired -->
                <div
                    bind:this={iconEl}
                    class="ow-z-5 ow-custom-block-icon {widget?.iconPosition ==
                    'right'
                        ? 'right'
                        : 'left'}"
                ></div>
            {/if}

            <!-- {#if widget.dataviewQuery} -->
            <section class="ow-custom-block-query-result">
                
                <strong class="">+10</strong>
            </section>
            <!-- {/if} -->

            <div
                class="ow-custom-block-text ow-flex-col ow-items-start ow-w-full ow-h-auto"
            >
                <h3 class="ow-custom-block-title">
                    {widget.title}
                </h3>

                {#if widget.content}
                    <section class="ow-custom-block-content ow-mb-1">
                        <p class="ow-whitespace-pre-wrap">{widget.content}</p>
                    </section>
                {/if}
            </div>
        </div>
    {:else}
        <div class="text-sm text-muted">No widget data provided.</div>
    {/if}
</article>
