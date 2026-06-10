<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// 1) The Markdown bio + frontmatter for this player.
const { data: player } = await useAsyncData(`player-${slug}`, () =>
  queryContent('/players', slug).findOne()
)
if (!player.value) {
  throw createError({ statusCode: 404, statusMessage: 'Player not found' })
}

// 2) Stats snapshot for this player, read from the committed data/stats.json
//    via our server route. No API key / rate limits at build time.
const { data: meta } = await useAsyncData(`meta-${slug}`, () =>
  $fetch(`/api/stats/${slug}`)
)

// Display values: hand-authored frontmatter wins, then fall back to the snapshot.
const team = computed(() => player.value?.team || meta.value?.team)
const position = computed(() => player.value?.position || meta.value?.position)

// Season stats: prefer curated frontmatter rows, else the synced snapshot rows.
const stats = computed(
  () => player.value?.seasonStats ?? meta.value?.seasonStats ?? []
)

// Headline stat tiles: prefer a "Career" row, else the last season listed.
const careerLine = computed(() => {
  if (!stats.value.length) return null
  return stats.value.find((r: any) => /career/i.test(r.season)) ?? stats.value[stats.value.length - 1]
})

const initials = computed(() =>
  (player.value?.name ?? '')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
)

// 3) Prev/next navigation. Fetch the full ranked list once — the key
//    'player-nav' is shared across ALL player pages, so Nuxt caches it and
//    navigating between players doesn't refetch it.
const { data: navList } = await useAsyncData('player-nav', async () => {
  const list = await queryContent('/players').only(['rank', 'name', '_path']).find()
  return list.sort((a, b) => Number(a.rank) - Number(b.rank))
})

const prev = computed(() => {
  const i = navList.value?.findIndex((p) => p._path === player.value?._path) ?? -1
  return i > 0 ? navList.value![i - 1] : null
})
const next = computed(() => {
  const i = navList.value?.findIndex((p) => p._path === player.value?._path) ?? -1
  return i >= 0 && i < navList.value!.length - 1 ? navList.value![i + 1] : null
})

// 4) Award-hover highlighting: Accolades (left column) reports which tile is
//    hovered; we look up that award's seasons + color and hand them to the
//    stats table (right column). Classic "siblings talk through the parent".
const hoveredAward = ref<string | null>(null)
const highlightSeasons = computed(() =>
  hoveredAward.value ? meta.value?.awards?.awardSeasons?.[hoveredAward.value] ?? [] : []
)
const highlightClass = computed(() =>
  hoveredAward.value ? awardColors[hoveredAward.value]?.row ?? '' : ''
)

// Arrow keys flip between players. Listeners only exist in the browser, so we
// add them on mount and clean up on unmount (runs when leaving the page).
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' && prev.value) navigateTo(prev.value._path)
  if (e.key === 'ArrowRight' && next.value) navigateTo(next.value._path)
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <article v-if="player">
    <!-- Prev / list / next navigation -->
    <nav class="mb-6 flex items-center justify-between gap-3 text-sm">
      <NuxtLink
        v-if="prev"
        :to="prev._path!"
        class="group inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-stone-400 transition hover:border-orange-300/40 hover:text-orange-300"
      >
        <span aria-hidden="true">&larr;</span>
        <span class="truncate">
          <span class="font-display text-stone-500 group-hover:text-orange-300/70">#{{ prev.rank }}</span>
          {{ prev.name }}
        </span>
      </NuxtLink>
      <span v-else />

      <ListLink />

      <NuxtLink
        v-if="next"
        :to="next._path!"
        class="group inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-right text-stone-400 transition hover:border-orange-300/40 hover:text-orange-300"
      >
        <span class="truncate">
          <span class="font-display text-stone-500 group-hover:text-orange-300/70">#{{ next.rank }}</span>
          {{ next.name }}
        </span>
        <span aria-hidden="true">&rarr;</span>
      </NuxtLink>
      <span v-else />
    </nav>

    <div class="grid gap-8 lg:grid-cols-[360px_1fr]">
      <!-- ============ LEFT: the featured trading card ============ -->
      <div class="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div class="holo-ring rounded-3xl p-[3px] shadow-2xl shadow-orange-500/10">
          <div class="overflow-hidden rounded-[21px] bg-stone-900">
            <div class="relative aspect-[3/4]">
              <span
                class="absolute left-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-display text-2xl font-bold text-stone-950 shadow-lg"
              >
                {{ player.rank }}
              </span>

              <NuxtImg
                v-if="player.image"
                :src="player.image"
                :alt="player.name"
                format="webp"
                sizes="100vw lg:360px"
                class="h-full w-full object-cover object-top"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-800 to-stone-700"
              >
                <span class="font-display text-7xl font-bold text-stone-500">{{ initials }}</span>
              </div>

              <div
                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-transparent p-5 pt-16"
              >
                <p v-if="player.nickname" class="text-xs italic text-stone-300">
                  "{{ player.nickname }}"
                </p>
                <h1 class="heading text-3xl leading-none text-white">{{ player.name }}</h1>
                <p class="mt-1 text-sm font-medium text-orange-300">
                  <span v-if="team">{{ team }}</span>
                  <span v-if="player.number"> · #{{ player.number }}</span>
                  <span v-if="position"> · {{ position }}</span>
                </p>
              </div>
            </div>

            <!-- Stat tiles strip along the bottom of the card -->
            <div v-if="careerLine" class="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
              <div class="p-3 text-center">
                <p class="font-display text-2xl font-bold text-white">{{ careerLine.ppg ?? '—' }}</p>
                <p class="text-[10px] uppercase tracking-widest text-stone-400">PPG</p>
              </div>
              <div class="p-3 text-center">
                <p class="font-display text-2xl font-bold text-white">{{ careerLine.rpg ?? '—' }}</p>
                <p class="text-[10px] uppercase tracking-widest text-stone-400">RPG</p>
              </div>
              <div class="p-3 text-center">
                <p class="font-display text-2xl font-bold text-white">{{ careerLine.apg ?? '—' }}</p>
                <p class="text-[10px] uppercase tracking-widest text-stone-400">APG</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Accolades block, below the card -->
        <Accolades v-if="meta?.awards" :awards="meta.awards" @hover="hoveredAward = $event" />

        <!-- Franchises the player suited up for -->
        <TeamHistory v-if="meta?.teams" :teams="meta.teams" />
      </div>

      <!-- ============ RIGHT: bio + metadata + full stats ============ -->
      <div class="space-y-8">
        <section>
          <h2 class="heading mb-3 text-xl text-stone-300">The Story</h2>
          <div class="prose prose-invert max-w-none prose-headings:heading prose-headings:text-stone-200">
            <ContentRenderer :value="player" />
          </div>
        </section>

        <!-- Snapshot-sourced facts (from data/stats.json via `npm run sync`) -->
        <section v-if="meta" class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 class="heading mb-3 text-sm text-stone-400">Profile</h2>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div v-if="position">
              <dt class="text-stone-500">Position</dt>
              <dd class="font-medium text-stone-100">{{ position }}</dd>
            </div>
            <div v-if="meta.height">
              <dt class="text-stone-500">Height</dt>
              <dd class="font-medium text-stone-100">{{ formatHeight(meta.height) }}</dd>
            </div>
            <div v-if="meta.weight">
              <dt class="text-stone-500">Weight</dt>
              <dd class="font-medium text-stone-100">{{ formatWeight(meta.weight) }}</dd>
            </div>
            <div v-if="meta.college">
              <dt class="text-stone-500">College</dt>
              <dd class="font-medium text-stone-100">{{ meta.college }}</dd>
            </div>
            <div v-if="meta.draft_year">
              <dt class="text-stone-500">Draft year</dt>
              <dd class="font-medium text-stone-100">{{ meta.draft_year }}</dd>
            </div>
          </dl>
        </section>

        <!-- Full per-season stats -->
        <StatsTable
          v-if="stats.length"
          :rows="stats"
          :title-seasons="meta?.awards?.titleSeasons"
          :highlight-seasons="highlightSeasons"
          :highlight-class="highlightClass"
        />
      </div>
    </div>
  </article>
</template>
