<script setup lang="ts">
type Player = {
  rank: number
  name: string
  _path?: string
  titles?: number
  mvp?: number
  dpoy?: number
  fromYear?: number | null
  toYear?: number | null
  dimmed?: boolean
}

const props = defineProps<{ players: Player[] }>()

const years = (p: Player) => (p.fromYear ? `${p.fromYear}–${p.toYear}` : '—')

// --- sorting ---
type SortKey = 'rank' | 'titles' | 'mvp' | 'dpoy'
const sortKey = ref<SortKey>('rank')
const sortDir = ref<'asc' | 'desc'>('asc')

function sortBy(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'rank' ? 'asc' : 'desc' // accolades read best high→low
  }
}

const arrow = (key: SortKey) =>
  sortKey.value === key ? (sortDir.value === 'asc' ? ' ▲' : ' ▼') : ''

const sorted = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...props.players].sort((a, b) => {
    const av = (a as any)[key] ?? 0
    const bv = (b as any)[key] ?? 0
    if (av !== bv) return (av - bv) * dir
    return a.rank - b.rank // tie-break: keep equal counts in rank order
  })
})
</script>

<template>
  <div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-white/10 text-left text-xs uppercase tracking-wider text-stone-500">
          <th
            class="cursor-pointer select-none px-4 py-3 font-medium hover:text-stone-300"
            @click="sortBy('rank')"
          >
            #{{ arrow('rank') }}
          </th>
          <th class="px-4 py-3 font-medium">Player</th>
          <th
            class="cursor-pointer select-none px-4 py-3 text-center font-medium hover:text-stone-300"
            @click="sortBy('titles')"
          >
            Titles{{ arrow('titles') }}
          </th>
          <th
            class="cursor-pointer select-none px-4 py-3 text-center font-medium hover:text-stone-300"
            @click="sortBy('mvp')"
          >
            MVP{{ arrow('mvp') }}
          </th>
          <th
            class="cursor-pointer select-none px-4 py-3 text-center font-medium hover:text-stone-300"
            @click="sortBy('dpoy')"
          >
            DPOY{{ arrow('dpoy') }}
          </th>
          <th class="px-4 py-3 text-right font-medium">Years</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="p in sorted"
          :key="p._path"
          class="border-b border-white/5 transition last:border-0 hover:bg-white/5"
          :class="{ 'opacity-40': p.dimmed }"
        >
          <td class="px-4 py-2.5 font-display text-stone-400">{{ p.rank }}</td>
          <td class="px-4 py-2.5">
            <NuxtLink
              :to="p._path!"
              class="font-medium text-stone-100 transition hover:text-orange-300 hover:underline"
            >
              {{ p.name }}
            </NuxtLink>
          </td>
          <td
            class="px-4 py-2.5 text-center tabular-nums"
            :class="p.titles ? 'font-semibold text-amber-300' : 'text-stone-600'"
          >
            {{ p.titles || '—' }}
          </td>
          <td
            class="px-4 py-2.5 text-center tabular-nums"
            :class="p.mvp ? 'text-stone-100' : 'text-stone-600'"
          >
            {{ p.mvp || '—' }}
          </td>
          <td
            class="px-4 py-2.5 text-center tabular-nums"
            :class="p.dpoy ? 'text-stone-100' : 'text-stone-600'"
          >
            {{ p.dpoy || '—' }}
          </td>
          <td class="px-4 py-2.5 text-right tabular-nums text-stone-400">{{ years(p) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
