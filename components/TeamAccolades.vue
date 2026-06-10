<script setup lang="ts">
// Franchise accolades, themed by the team's colors (uses the --t1/--t2 CSS
// variables set by the team page). The championship tile shows one trophy
// per title — the Celtics get a whole wall of them.
const props = defineProps<{
  accolades: {
    founded?: number
    wins?: number
    losses?: number
    playoffApps?: number
    divTitles?: number
    confTitles?: number
    titles?: number
  }
}>()

// Championships and conference titles render one icon per unit; the
// high-count accolades (division titles, playoff appearances) are number-only.
const tiles = computed(() => [
  { value: props.accolades.titles ?? 0, label: 'NBA Championships', type: 'trophy' as const },
  { value: props.accolades.confTitles ?? 0, label: 'Conference titles', type: 'banner' as const },
  { value: props.accolades.divTitles ?? 0, label: 'Division titles', type: null },
  { value: props.accolades.playoffApps ?? 0, label: 'Playoff appearances', type: null },
])

const record = computed(() =>
  props.accolades.wins != null
    ? `${props.accolades.wins}–${props.accolades.losses} all-time · est. ${props.accolades.founded}`
    : null
)
</script>

<template>
  <section class="team-border team-tint rounded-2xl border p-5">
    <h2 class="heading mb-4 text-sm text-stone-400">Accolades</h2>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="tile in tiles"
        :key="tile.label"
        class="rounded-xl border border-white/10 bg-stone-950/40 px-3 py-3 text-center"
      >
        <p class="font-display text-3xl font-bold leading-none" :style="{ color: 'var(--t2)' }">
          {{ tile.value }}
        </p>
        <p class="mt-1.5 text-[11px] uppercase tracking-wide text-stone-400">{{ tile.label }}</p>
        <!-- One icon per unit (championships and conference titles only) -->
        <p
          v-if="tile.type && tile.value"
          class="mt-2 flex flex-wrap items-end justify-center gap-0.5"
          :title="`${tile.value} ${tile.label.toLowerCase()}`"
        >
          <template v-for="n in tile.value" :key="n">
            <TrophyIcon
              v-if="tile.type === 'trophy'"
              class="h-6 w-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            />
            <AccoladeIcon
              v-else
              type="banner"
              class="h-6 w-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            />
          </template>
        </p>
      </div>
    </div>

    <p v-if="record" class="mt-3 text-center text-xs tabular-nums text-stone-500">
      {{ record }}
    </p>
  </section>
</template>

<style scoped>
/* Same per-team theming hooks as the team page. */
.team-border {
  border-color: color-mix(in srgb, var(--t1) 45%, white 8%);
}
.team-tint {
  background: color-mix(in srgb, var(--t1) 10%, transparent);
}
</style>
