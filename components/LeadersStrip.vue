<script setup lang="ts">
type Player = {
  rank: number
  name: string
  image?: string
  _path?: string
  titles?: number
  mvp?: number
  allStar?: number
  ppg?: number | null
  rpg?: number | null
  apg?: number | null
}

const props = defineProps<{ players: Player[] }>()

const categories = [
  { key: 'titles', label: 'Most titles', gold: true },
  { key: 'mvp', label: 'Most MVPs', gold: true },
  { key: 'allStar', label: 'Most All-Star' },
  { key: 'ppg', label: 'Best PPG' },
  { key: 'rpg', label: 'Best RPG' },
  { key: 'apg', label: 'Best APG' },
] as const

// For each category, the player with the highest value. Players come in rank
// order, so on a tie the higher-ranked player wins (strict > keeps the first).
const leaders = computed(() =>
  categories
    .map((cat) => {
      let best: Player | null = null
      for (const p of props.players) {
        const v = (p as any)[cat.key]
        if (v != null && (best === null || v > (best as any)[cat.key])) best = p
      }
      if (!best) return null
      const value = (best as any)[cat.key]
      return {
        ...cat,
        player: best,
        // Counts show plain; per-game averages show one decimal.
        display: ['ppg', 'rpg', 'apg'].includes(cat.key) ? Number(value).toFixed(1) : value,
      }
    })
    .filter((l) => l !== null && l.display > 0)
)
</script>

<template>
  <div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    <NuxtLink
      v-for="l in leaders"
      :key="l!.label"
      :to="l!.player._path!"
      class="group rounded-2xl border border-white/10 bg-white/5 p-3 text-center transition hover:-translate-y-0.5 hover:border-orange-300/40"
    >
      <p class="text-[10px] uppercase tracking-widest text-stone-500">{{ l!.label }}</p>
      <p
        class="font-display text-2xl font-bold leading-tight"
        :class="l!.gold ? 'text-amber-300' : 'text-orange-400'"
      >
        {{ l!.display }}
      </p>
      <div class="mt-1.5 flex items-center justify-center gap-1.5">
        <NuxtImg
          v-if="l!.player.image"
          :src="l!.player.image"
          :alt="l!.player.name"
          format="webp"
          width="40"
          height="40"
          class="h-5 w-5 rounded-full object-cover object-top"
        />
        <span class="truncate text-xs text-stone-300 transition group-hover:text-orange-300">
          {{ l!.player.name }}
        </span>
      </div>
    </NuxtLink>
  </div>
</template>
