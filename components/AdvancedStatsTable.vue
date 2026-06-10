<script setup lang="ts">
// A sortable stats table driven by a column config, so the advanced-stats page
// can render different column sets (Shooting / Per Game) from one component.
type Row = Record<string, any> & { season: string }
type Col = {
  key: string
  label: string
  // 'pct' renders 0.497 as 49.7; numbers render as-is; null/undefined as '—'.
  fmt?: 'pct'
}

const props = defineProps<{
  title: string
  rows: Row[]
  columns: Col[]
  titleSeasons?: string[]
}>()

const titles = computed(() => new Set(props.titleSeasons ?? []))
const isTitle = (s: string) => titles.value.has(s)

// --- sorting (career row pinned to the bottom, like the main stats table) ---
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('desc')

function sortBy(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'season' ? 'asc' : 'desc'
  }
}
const arrow = (key: string) =>
  sortKey.value === key ? (sortDir.value === 'asc' ? ' ▲' : ' ▼') : ''

const careerRow = computed(() => props.rows.find((r) => /career/i.test(r.season)))
const seasonRows = computed(() => props.rows.filter((r) => !/career/i.test(r.season)))

const sortedSeasons = computed(() => {
  const key = sortKey.value
  if (!key) return seasonRows.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...seasonRows.value].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    return av < bv ? -dir : av > bv ? dir : 0
  })
})

const displayRows = computed(() =>
  careerRow.value ? [...sortedSeasons.value, careerRow.value] : sortedSeasons.value
)

function format(row: Row, col: Col): string {
  const v = row[col.key]
  if (v == null) return '—'
  if (col.fmt === 'pct') return (v * 100).toFixed(1)
  return String(v)
}
</script>

<template>
  <section class="rounded-2xl border border-white/10 bg-white/5 p-5">
    <h2 class="heading mb-4 text-sm text-stone-400">{{ title }}</h2>
    <div class="overflow-x-auto">
      <table class="w-full whitespace-nowrap text-sm">
        <thead>
          <tr class="border-b border-white/10 text-left text-xs uppercase tracking-wider text-stone-500">
            <th
              class="cursor-pointer select-none py-2 pr-3 font-medium hover:text-stone-300"
              @click="sortBy('season')"
            >
              Season{{ arrow('season') }}
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="cursor-pointer select-none px-2 py-2 text-right font-medium hover:text-stone-300"
              @click="sortBy(col.key)"
            >
              {{ col.label }}{{ arrow(col.key) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in displayRows"
            :key="row.season"
            class="border-b border-white/5 last:border-0"
            :class="{
              'bg-amber-400/5 font-semibold text-amber-200': /career/i.test(row.season),
              'bg-amber-400/[0.06]': isTitle(row.season),
            }"
          >
            <td class="py-2 pr-3 font-medium">
              <span
                :class="isTitle(row.season)
                  ? 'underline decoration-amber-400 decoration-2 underline-offset-4'
                  : ''"
              >
                {{ row.season }}
              </span>
              <span v-if="row.team && row.team !== 'TOT'" class="ml-1.5 text-xs text-stone-500">{{ row.team }}</span>
              <span v-if="isTitle(row.season)" class="ml-1" title="NBA champion this season">🏆</span>
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-2 py-2 text-right tabular-nums"
            >
              {{ format(row, col) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
