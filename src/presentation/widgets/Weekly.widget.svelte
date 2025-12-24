<script lang="ts">
    // import { createEventDispatcher } from 'svelte';
    import { moment } from 'obsidian';
    import ObsidianEngine from "src/application/obsidian-engine";

    // const dispatch = createEventDispatcher();
    // use a callback prop instead of createEventDispatcher (deprecated in your env)
    export let onSelect: (payload: { date: string }) => void = () => {};

    // compute the current ISO week (Mon-Sun)
    const today = moment();
    const todayStr = today.format('YYYY-MM-DD');
    const weekStart = moment(today).startOf('isoWeek');

    type Day = { date: string; dayNumber: string; shortName: string; isActive: boolean; isWeekend: boolean; dots?: string[] };

    let days: Day[] = [];
    // selectedDate is the date the user clicks (does NOT change the "active" visual)
    let selectedDate = todayStr;

    for (let i = 0; i < 7; i++) {
        const d = moment(weekStart).add(i, 'days');
        const isActive = d.format('YYYY-MM-DD') === todayStr;
        const isWeekend = d.isoWeekday() >= 6; // 6 = Saturday, 7 = Sunday
        // simple visual dots: active day shows two white dots; other days may show 0-2 muted dots
        const dots = isActive ? ['white', 'white'] : (i % 3 === 0 ? ['#7c3aed'] : (i % 4 === 0 ? ['#fb923c'] : []));
        days.push({
            date: d.format('YYYY-MM-DD'),
            dayNumber: d.format('D'),
            shortName: d.format('ddd').replace(/\./g, '').toUpperCase(),
            isActive,
            isWeekend,
        });
    }

    // Reactive values: month derived from the currently selected date (selection doesn't alter active button)
    $: selectedMoment = moment(selectedDate);
    $: monthName = selectedMoment.format('MMMM');

    // Year is independent from the month so you can add links or change it separately.
    // Exported so parent components can set it if needed.
    export let selectedYear = today.format('YYYY');

    function selectDay(day: Day) {
        // update selection only; do NOT change days[].isActive (active stays as today's date)
        selectedDate = day.date;
        onSelect({ date: day.date });
    }

    // build vault-relative path: 50_DIARIO/año/nombre_mes/nota.md
    function notePathForDate(dateStr: string) {
        const m = moment(dateStr);
        const y = m.format('YYYY');
        // use full month name as folder (lowercase to match example); adjust if your folder names differ
        const monthFolder = m.format('MMMM').toLowerCase();
        const fileName = `${m.format('YYYY-MM-DD')}.md`;
        return `50_DIARIO/${y}/${monthFolder}/${fileName}`;
    }

    // Reemplazado: usar ObsidianEngine para abrir la nota y luego seleccionar el día
    async function openNote(day: Day) {
        const path = notePathForDate(day.date);
        try {
            await ObsidianEngine.getInstance().openLink(path, true);
        } catch (err) {
            // fallback: seleccionar el día aun si la apertura falla
        }
        selectDay(day);
    }
</script>

<div class="obsidian-widgets">
    <div class="ow-widget-card">
        <div class="weekly-header ow-px-4 ow-pt-2">
            <div class="weekly-title">
                <div class="week-subtitle">SEMANA {selectedMoment.isoWeek()}</div>
                <div class="monthly-name">{monthName} {selectedYear}</div>
            </div>
            <div class="header-actions">
                
            </div>
        </div>
        <div class="ow-separator"></div>
        <div class="weekly-widget">
            <div class="week-row ow-px-4 ow-py-1">
                {#each days as day}
                    <button
                        type="button"
                        class="day-button {day.isActive ? 'active' : ''} {day.isWeekend ? 'weekend' : ''}"
                        on:click={() => openNote(day)}
                        aria-pressed={day.isActive}
                    >
                        <div class="day-name">{day.shortName}</div>
                        <div class="day-number">{day.dayNumber}</div>

                        {#if day.dots && day.dots.length}
                            <div class="day-indicators">
                                {#each day.dots as color}
                                    <span class="indicator" style="background-color: {color};"></span>
                                {/each}
                            </div>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>

