<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// Player identity (name/rank) from the Markdown content…
const { data: player } = await useAsyncData(`player-${slug}`, () =>
  queryContent('/players', slug).findOne()
)
if (!player.value) {
  throw createError({ statusCode: 404, statusMessage: 'Player not found' })
}

// …and the full stat lines from the snapshot.
const { data: meta } = await useAsyncData(`meta-${slug}`, () =>
  $fetch(`/api/stats/${slug}`)
)

const rows = computed(() => meta.value?.seasonStats ?? [])

const shootingCols = [
  { key: 'gp', label: 'GP' },
  { key: 'fgm', label: 'FGM' },
  { key: 'fga', label: 'FGA' },
  { key: 'fgPct', label: 'FG%', fmt: 'pct' as const },
  { key: 'tpm', label: '3PM' },
  { key: 'tpa', label: '3PA' },
  { key: 'tpPct', label: '3P%', fmt: 'pct' as const },
  { key: 'ftm', label: 'FTM' },
  { key: 'fta', label: 'FTA' },
  { key: 'ftPct', label: 'FT%', fmt: 'pct' as const },
]

const perGameCols = [
  { key: 'age', label: 'Age' },
  { key: 'gp', label: 'GP' },
  { key: 'gs', label: 'GS' },
  { key: 'min', label: 'MIN' },
  { key: 'ppg', label: 'PTS' },
  { key: 'oreb', label: 'OREB' },
  { key: 'dreb', label: 'DREB' },
  { key: 'rpg', label: 'REB' },
  { key: 'apg', label: 'AST' },
  { key: 'stl', label: 'STL' },
  { key: 'blk', label: 'BLK' },
  { key: 'tov', label: 'TOV' },
  { key: 'pf', label: 'PF' },
]
</script>

<template>
  <div v-if="player">
    <nav class="mb-6 flex items-center justify-between text-sm">
      <NuxtLink
        :to="`/players/${slug}`"
        class="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-stone-400 transition hover:border-orange-300/40 hover:text-orange-300"
      >
        &larr; {{ player.name }}
      </NuxtLink>
      <ListLink />
    </nav>

    <header class="mb-8 flex items-center gap-4">
      <NuxtImg
        v-if="player.image"
        :src="player.image"
        :alt="player.name"
        format="webp"
        width="96"
        height="96"
        class="h-14 w-14 rounded-full border border-white/10 object-cover object-top"
      />
      <div>
        <p class="text-xs uppercase tracking-widest text-stone-500">#{{ player.rank }} · Advanced stats</p>
        <h1 class="heading text-3xl text-white">{{ player.name }}</h1>
      </div>
    </header>

    <div class="space-y-8">
      <AdvancedStatsTable
        title="Shooting"
        :rows="rows"
        :columns="shootingCols"
        :title-seasons="meta?.awards?.titleSeasons"
      />
      <AdvancedStatsTable
        title="Per game"
        :rows="rows"
        :columns="perGameCols"
        :title-seasons="meta?.awards?.titleSeasons"
      />
      <p class="text-xs text-stone-500">
        Stats the NBA didn't record yet show as “—” (steals &amp; blocks from 1973-74,
        turnovers from 1977-78, three-pointers from 1979-80, games started from 1982).
        Click any column to sort.
      </p>
    </div>
  </div>
</template>
