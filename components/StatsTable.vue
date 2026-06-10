<script setup lang="ts">
type Row = {
  season: string
  gp?: number
  ppg?: number
  rpg?: number
  apg?: number
}

const props = defineProps<{
  rows: Row[]
  titleSeasons?: string[]
  // While an accolade tile is hovered: which seasons to tint, and with what.
  highlightSeasons?: string[]
  highlightClass?: string
}>()

const highlighted = computed(() => new Set(props.highlightSeasons ?? []))
const isHighlighted = (season: string) =>
  !!props.highlightClass && highlighted.value.has(season)

// --- championship highlighting (unchanged) ---
const titles = computed(() => new Set(props.titleSeasons ?? []))
const isTitle = (season: string) => titles.value.has(season)
const hasTitles = computed(() => (props.titleSeasons?.length ?? 0) > 0)

// --- sorting ---
type SortKey = 'season' | 'gp' | 'ppg' | 'rpg' | 'apg'
const sortKey = ref<SortKey | null>(null) // null = original (chronological) order
const sortDir = ref<'asc' | 'desc'>('desc')

function sortBy(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    // Stats read best high→low; seasons read best oldest→newest.
    sortDir.value = key === 'season' ? 'asc' : 'desc'
  }
}

const arrow = (key: SortKey) =>
  sortKey.value === key ? (sortDir.value === 'asc' ? ' ▲' : ' ▼') : ''

// Keep the Career row out of the sort and pin it to the bottom.
const careerRow = computed(() => props.rows.find((r) => /career/i.test(r.season)))
const seasonRows = computed(() => props.rows.filter((r) => !/career/i.test(r.season)))

const sortedSeasons = computed(() => {
  const key = sortKey.value
  if (!key) return seasonRows.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...seasonRows.value].sort((a, b) => {
    const av = a[key] as number | string | undefined
    const bv = b[key] as number | string | undefined
    if (av == null && bv == null) return 0
    if (av == null) return 1 // missing values sink to the bottom
    if (bv == null) return -1
    return (av as any) < (bv as any) ? -dir : (av as any) > (bv as any) ? dir : 0
  })
})

// Sorted seasons, with Career always last.
const displayRows = computed(() =>
  careerRow.value ? [...sortedSeasons.value, careerRow.value] : sortedSeasons.value
)
</script>

<template>
  <section class="rounded-2xl border border-white/10 bg-white/5 p-5">
    <div class="mb-4 flex items-baseline justify-between">
      <h2 class="heading text-sm text-stone-400">Stats</h2>
      <!-- This table only renders on /players/<slug>, so the route has the slug. -->
      <NuxtLink
        :to="`/players/${$route.params.slug}/stats`"
        class="text-xs font-medium text-orange-400 transition hover:text-orange-300 hover:underline"
      >
        Full stats &rarr;
      </NuxtLink>
    </div>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-white/10 text-left text-xs uppercase tracking-wider text-stone-500">
          <th
            class="cursor-pointer select-none py-2 font-medium hover:text-stone-300"
            @click="sortBy('season')"
          >
            Season{{ arrow('season') }}
          </th>
          <th
            class="cursor-pointer select-none py-2 text-right font-medium hover:text-stone-300"
            @click="sortBy('gp')"
          >
            GP{{ arrow('gp') }}
          </th>
          <th
            class="cursor-pointer select-none py-2 text-right font-medium hover:text-stone-300"
            @click="sortBy('ppg')"
          >
            PPG{{ arrow('ppg') }}
          </th>
          <th
            class="cursor-pointer select-none py-2 text-right font-medium hover:text-stone-300"
            @click="sortBy('rpg')"
          >
            RPG{{ arrow('rpg') }}
          </th>
          <th
            class="cursor-pointer select-none py-2 text-right font-medium hover:text-stone-300"
            @click="sortBy('apg')"
          >
            APG{{ arrow('apg') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in displayRows"
          :key="row.season"
          class="border-b border-white/5 transition-colors duration-150 last:border-0"
          :class="[
            {
              'bg-amber-400/5 font-semibold text-amber-200': /career/i.test(row.season),
              'bg-amber-400/[0.06]': isTitle(row.season) && !isHighlighted(row.season),
            },
            isHighlighted(row.season) ? highlightClass : '',
          ]"
        >
          <td class="py-2 font-medium">
            <span
              :class="isTitle(row.season)
                ? 'underline decoration-amber-400 decoration-2 underline-offset-4'
                : ''"
            >
              {{ row.season }}
            </span>
            <span v-if="isTitle(row.season)" class="ml-1" title="NBA champion this season">🏆</span>
          </td>
          <td class="py-2 text-right tabular-nums">{{ row.gp ?? '—' }}</td>
          <td class="py-2 text-right tabular-nums">{{ row.ppg ?? '—' }}</td>
          <td class="py-2 text-right tabular-nums">{{ row.rpg ?? '—' }}</td>
          <td class="py-2 text-right tabular-nums">{{ row.apg ?? '—' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="hasTitles" class="mt-3 text-xs text-stone-500">
      <span class="underline decoration-amber-400 decoration-2 underline-offset-2">Gold</span>
      🏆 marks a championship season.
    </p>
  </section>
</template>
