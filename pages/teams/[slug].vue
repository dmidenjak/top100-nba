<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// The team document (frontmatter + Wikipedia-sourced description).
const { data: team } = await useAsyncData(`team-${slug}`, () =>
  queryContent('/teams', slug).findOne()
)
if (!team.value) {
  throw createError({ statusCode: 404, statusMessage: 'Team not found' })
}

// Top-100 legends who played for this franchise: tenure from the rosters
// endpoint, identity (name/rank/image) from the player content. Both calls
// use shared keys, so they're fetched once and cached across all team pages.
const { data: rosters } = await useAsyncData('rosters', () =>
  $fetch<Record<string, { slug: string; from: number; to: number }[]>>('/api/rosters')
)
const { data: identities } = await useAsyncData('player-identities', async () => {
  const list = await queryContent('/players').only(['rank', 'name', 'image', '_path']).find()
  return list.map((p) => ({
    slug: p._path!.split('/').pop()!,
    rank: Number(p.rank),
    name: p.name as string,
    image: p.image as string | undefined,
    path: p._path!,
  }))
})

const legends = computed(() => {
  const tenure = rosters.value?.[String(team.value!.nbaId)] ?? []
  const bySlug = new Map(identities.value?.map((p) => [p.slug, p]))
  return tenure
    .map((t) => {
      const p = bySlug.get(t.slug)
      return p ? { ...p, from: t.from, to: t.to } : null
    })
    .filter((p) => p !== null)
})

// Per-team theme: the franchise's brand colors drive borders, the logo ring,
// the glow, and hovers via the --t1/--t2 CSS variables set on the root.
const colors = computed(
  () => teamColors[Number(team.value?.nbaId)] ?? { primary: '#f97316', secondary: '#fbbf24' }
)

useSeoMeta({ title: () => `${team.value?.name} — TOP 100` })
</script>

<template>
  <article
    v-if="team"
    class="relative"
    :style="{ '--t1': colors.primary, '--t2': colors.secondary }"
  >
    <!-- Soft arena glow in the team's primary color -->
    <div class="team-glow pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[60rem] max-w-[120vw] -translate-x-1/2" />

    <nav class="mb-6 flex items-center justify-between text-sm">
      <NuxtLink
        to="/teams"
        class="team-border inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-stone-400 transition hover:text-white"
      >
        &larr; All teams
      </NuxtLink>
      <ListLink />
    </nav>

    <header class="mb-8 flex items-center gap-5">
      <div class="team-ring rounded-2xl p-[2px]">
        <div class="rounded-[14px] bg-stone-900 p-3">
          <img :src="team.logo" :alt="team.name" class="h-32 w-32 object-contain" />
        </div>
      </div>
      <div>
        <p class="text-xs font-bold uppercase tracking-widest" :style="{ color: 'var(--t2)' }">
          {{ team.abbr }}
        </p>
        <h1 class="heading text-4xl text-white">{{ team.name }}</h1>
        <!-- Team-colored underline bar -->
        <div class="team-ring mt-2 h-1 w-24 rounded-full" />
      </div>
    </header>

    <div class="grid gap-8 lg:grid-cols-[1fr_320px]">
      <!-- The story -->
      <section>
        <h2 class="heading mb-3 text-xl text-stone-300">The Story</h2>
        <div class="prose prose-invert max-w-none">
          <ContentRenderer :value="team" />
        </div>
      </section>

      <!-- Legends who wore the jersey -->
      <aside v-if="legends.length" class="lg:sticky lg:top-6 lg:self-start">
        <section class="team-border team-tint rounded-2xl border p-5">
          <h2 class="heading mb-4 text-sm text-stone-400">
            Top 100 legends · {{ legends.length }}
          </h2>
          <ul class="space-y-2.5">
            <li v-for="p in legends" :key="p!.slug">
              <NuxtLink :to="p!.path" class="legend-link group flex items-center gap-3">
                <NuxtImg
                  v-if="p!.image"
                  :src="p!.image"
                  :alt="p!.name"
                  format="webp"
                  width="72"
                  height="72"
                  class="h-9 w-9 rounded-full object-cover object-top"
                />
                <span class="min-w-0 flex-1">
                  <span class="legend-name block truncate text-sm font-medium text-stone-100 transition">
                    <span class="font-display text-stone-500">#{{ p!.rank }}</span>
                    {{ p!.name }}
                  </span>
                  <span class="block text-xs tabular-nums text-stone-500">{{ p!.from }}–{{ p!.to }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </article>
</template>

<style scoped>
/* All of these derive from the two CSS variables set on the root, so the
   whole page recolors per franchise. color-mix keeps dark brand colors
   visible by blending toward transparent at controlled strength. */
.team-ring {
  background: linear-gradient(135deg, var(--t1), var(--t2));
}
.team-border {
  border-color: color-mix(in srgb, var(--t1) 45%, white 8%);
}
.team-tint {
  background: color-mix(in srgb, var(--t1) 10%, transparent);
}
.team-glow {
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--t1) 22%, transparent),
    transparent
  );
}
.legend-link:hover .legend-name {
  color: var(--t2);
}
</style>
