<script setup lang="ts">
interface Awards {
  championships?: number
  mvp?: number
  finalsMvp?: number
  dpoy?: number
  allStar?: number
  allNba?: { first?: number; second?: number; third?: number }
}

const props = defineProps<{ awards: Awards }>()

// Tell the parent which award tile is being hovered (null = none), so it can
// highlight the matching seasons in the stats table.
const emit = defineEmits<{ hover: [key: string | null] }>()

// Build a list of only the accolades the player actually has (non-zero).
// `gold` flags the marquee honours; `key` matches awardSeasons + awardColors.
const items = computed(() => {
  const a = props.awards
  const list: { key: string; value: number; label: string; gold?: boolean }[] = []
  if (a.championships) list.push({ key: 'championships', value: a.championships, label: 'NBA Champion', gold: true })
  if (a.mvp) list.push({ key: 'mvp', value: a.mvp, label: 'MVP' })
  if (a.finalsMvp) list.push({ key: 'finalsMvp', value: a.finalsMvp, label: 'Finals MVP' })
  if (a.dpoy) list.push({ key: 'dpoy', value: a.dpoy, label: 'Defensive POY' })
  if (a.allStar) list.push({ key: 'allStar', value: a.allStar, label: 'All-Star' })
  if (a.allNba?.first) list.push({ key: 'allNbaFirst', value: a.allNba.first, label: 'All-NBA 1st' })
  if (a.allNba?.second) list.push({ key: 'allNbaSecond', value: a.allNba.second, label: 'All-NBA 2nd' })
  if (a.allNba?.third) list.push({ key: 'allNbaThird', value: a.allNba.third, label: 'All-NBA 3rd' })
  return list
})
</script>

<template>
  <section v-if="items.length" class="rounded-2xl border border-white/10 bg-white/5 p-5">
    <h2 class="heading mb-4 text-sm text-stone-400">Accolades</h2>
    <ul class="grid grid-cols-2 gap-3">
      <li
        v-for="item in items"
        :key="item.key"
        class="cursor-default rounded-xl border px-3 py-2 text-center transition"
        :class="[
          item.gold ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/5',
          awardColors[item.key]?.tile,
        ]"
        @mouseenter="emit('hover', item.key)"
        @mouseleave="emit('hover', null)"
      >
        <p
          class="font-display text-2xl font-bold leading-none"
          :class="item.gold ? 'text-amber-300' : 'text-white'"
        >
          {{ item.value }}<span class="text-base">×</span>
        </p>
        <p class="mt-1 text-[11px] uppercase tracking-wide text-stone-400">{{ item.label }}</p>
      </li>
    </ul>
    <p class="mt-3 hidden text-[11px] text-stone-500 lg:block">
      Hover an award to see those seasons in the stats table.
    </p>
  </section>
</template>
