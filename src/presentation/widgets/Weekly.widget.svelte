<script lang="ts">
    import { moment } from "obsidian";
    import ObsidianEngine from "src/application/obsidian-engine";
    import type { WeekDayInterface } from "src/types/week-day.interface";
    import type { WeekPropsSettingsInterface } from "src/types/week-props-settings.interface";
    import { onMount } from "svelte";

    export let data: WeekPropsSettingsInterface;

    const obsidianEngine = ObsidianEngine.getInstance();
    const settings = obsidianEngine.getSettings();

    // compute the current ISO week (Mon-Sun)
    const today = moment().isoWeekYear(data.year).isoWeek(data.week);
    const weekStart = today.clone().startOf("isoWeek");

    const todayStr = moment(new Date()).format("YYYY-MM-DD");

    let days: WeekDayInterface[] = [];
    let selectedDate = weekStart;

    for (let i = 0; i < 7; i++) {
        const day = moment(weekStart).add(i, "days");
        const isActive = day.format("YYYY-MM-DD") === todayStr;
        const isWeekend = day.isoWeekday() >= 6; // 6 = Saturday, 7 = Sunday
        // simple visual dots: active day shows two white dots; other days may show 0-2 muted dots
        const dots = isActive
            ? ["white", "white"]
            : i % 3 === 0
              ? ["#7c3aed"]
              : i % 4 === 0
                ? ["#fb923c"]
                : [];

        days.push({
            date: day.format("YYYY-MM-DD"),
            dayNumber: day.format("D"),
            shortName: day.format("ddd").replace(/\./g, "").toUpperCase(),
            isActive,
            isWeekend,
        });
    }

    let selectedMoment = moment(selectedDate);
    let monthName = selectedMoment.format("MMMM");
    let selectedYear = data.year || selectedMoment.format("YYYY");

    function notePathForDate() {
        const folder = data?.folderPath?.trim().length
            ? data.folderPath.trim()
            : settings.weekly.folderPath;
        const format = moment().format(
            data.notesPath || settings.weekly.notesPath,
        );
        return `${folder}/${format}`;
    }

    // Reemplazado: usar ObsidianEngine para abrir la nota y luego seleccionar el día
    async function openNote(day: WeekDayInterface) {
        // console.log("Opening note for day:", day);
        const path = notePathForDate();

        try {
            await obsidianEngine.openOrCreateFromTemplate(
                path + "/" + day.date + ".md",
                settings.dailyNoteTemplatePath || "",
            );
        } catch (err) {
            // fallback: seleccionar el día aun si la apertura falla
        }
    }

    onMount(async () => {});
</script>

<div class="obsidian-widgets">
    <div class="ow-widget-card">
        <div class="weekly-header ow-px-4 ow-pt-2">
            <div class="weekly-title">
                <div class="week-subtitle">
                    SEMANA {selectedMoment.isoWeek()}
                </div>
                <div class="monthly-name">{monthName} {selectedYear}</div>
            </div>
            <div class="header-actions"></div>
        </div>
        <div class="ow-separator"></div>
        <div class="weekly-widget">
            <div class="week-row ow-px-4 ow-py-1">
                {#each days as day}
                    <button
                        type="button"
                        class="day-button {day.isActive
                            ? 'active'
                            : ''} {day.isWeekend ? 'weekend' : ''}"
                        on:click={() => openNote(day)}
                        aria-pressed={day.isActive}
                    >
                        <div class="day-name">{day.shortName}</div>
                        <div class="day-number">{day.dayNumber}</div>

                        {#if day.dots && day.dots.length}
                            <div class="day-indicators">
                                {#each day.dots as color}
                                    <span
                                        class="indicator"
                                        style="background-color: {color};"
                                    ></span>
                                {/each}
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>
