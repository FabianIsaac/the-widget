<script lang="ts">
    import type { CustomWidgetInterface } from "src/types/index";
    import { onMount } from "svelte";
    import CustomBlock from "../components/Custom-block.component.svelte";
    import { ObsidianEngine } from "src/application";
    import { ExplorerEngine } from "src/application";

    interface Props {
        data: CustomWidgetInterface[];
    }

    let { data }: Props = $props();

    let engine = ObsidianEngine.getInstance();
    let explorer = ExplorerEngine.getInstance();

    onMount(async () => {
        
        const results = await explorer.getFilesByQuery("00_PANDORA/Tareas AND ext:md");
        console.log(
            "found",
            results.length,

        );
    });
</script>

<div class="ow-custom-widgets-wrap">
    {#each data as item}
        <CustomBlock widget={item} />
    {/each}
</div>
