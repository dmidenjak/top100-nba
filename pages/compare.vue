<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// All player identities (for the pickers)…
const { data: identities } = await useAsyncData('compare-identities', async () => {
  const list = await queryContent('/players')
    .only(['rank', 'name', 'image', 'team', '_path'])
    .find()
  return list
    .map((p) => ({
      slug: p._path!.split('/').pop()!,
      rank: Number(p.rank),
      name: p.name as string,
      image: p.image as string | undefined,
      team: p.team as string | undefined,
      path: p._path!,
    }))
    .sort((x, y) => x.rank - y.rank)
})

// …and the career/awards numbers for everyone, in one baked-in payload.
const { data: stats } = await useAsyncData('compare-data', () =>
  $fetch<Record<string, any>>('/api/compare')
)

// Selection state, initialised from ?a=…&b=… and written back to the URL so
// any comparison is shareable as a link.
const aSlug = ref<string | null>((route.query.a as string) || null)
const bSlug = ref<string | null>((route.query.b as string) || null)
watch([aSlug, bSlug], () => {
  router.replace({
    query: {
      ...(aSlug.value ? { a: aSlug.value } : {}),
      ...(bSlug.value ? { b: bSlug.value } : {}),
    },
  })
})

const a = computed(() => (aSlug.value ? identities.value?.find((p) => p.slug === aSlug.value) : null))
const b = computed(() => (bSlug.value ? identities.value?.find((p) => p.slug === bSlug.value) : null))
const aStats = computed(() => (aSlug.value ? stats.value?.[aSlug.value] : null))
const bStats = computed(() => (bSlug.value ? stats.value?.[bSlug.value] : null))
const ready = computed(() => !!(a.value && b.value && aStats.value && bStats.value))

// --- comparison rows ---
type RowDef = {
  label: string
  get: (s: any) => number | null | undefined
  fmt?: 'pct' | 'int'
  lowerIsBetter?: boolean
}
const careerRows: RowDef[] = [
  { label: 'Points', get: (s) => s.career?.ppg },
  { label: 'Rebounds', get: (s) => s.career?.rpg },
  { label: 'Assists', get: (s) => s.career?.apg },
  { label: 'Steals', get: (s) => s.career?.stl },
  { label: 'Blocks', get: (s) => s.career?.blk },
  { label: 'Turnovers', get: (s) => s.career?.tov, lowerIsBetter: true },
  { label: 'Minutes', get: (s) => s.career?.min },
  { label: 'FG%', get: (s) => s.career?.fgPct, fmt: 'pct' },
  { label: '3P%', get: (s) => s.career?.tpPct, fmt: 'pct' },
  { label: 'FT%', get: (s) => s.career?.ftPct, fmt: 'pct' },
  { label: 'Games', get: (s) => s.career?.gp, fmt: 'int' },
]
const accoladeRows: RowDef[] = [
  { label: 'Championships', get: (s) => s.awards?.championships, fmt: 'int' },
  { label: 'MVPs', get: (s) => s.awards?.mvp, fmt: 'int' },
  { label: 'Finals MVPs', get: (s) => s.awards?.finalsMvp, fmt: 'int' },
  { label: 'DPOYs', get: (s) => s.awards?.dpoy, fmt: 'int' },
  { label: 'All-Star', get: (s) => s.awards?.allStar, fmt: 'int' },
  { label: 'All-NBA teams', get: (s) => s.awards?.allNba, fmt: 'int' },
]

function fmtVal(v: number | null | undefined, fmt?: 'pct' | 'int') {
  if (v == null) return '—'
  if (fmt === 'pct') return (v * 100).toFixed(1)
  if (fmt === 'int') return String(v)
  return String(v)
}

// Which side wins this row? 'a' | 'b' | null (tie or missing data).
function winner(row: RowDef): 'a' | 'b' | null {
  const va = row.get(aStats.value)
  const vb = row.get(bStats.value)
  if (va == null || vb == null || va === vb) return null
  const aWins = row.lowerIsBetter ? va < vb : va > vb
  return aWins ? 'a' : 'b'
}

const years = (s: any) => (s?.fromYear ? `${s.fromYear}–${s.toYear}` : '—')

// Share: copy the current URL (it encodes the matchup).
const copied = ref(false)
async function share() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

useSeoMeta({ title: 'Compare players — TOP 100' })
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="heading mb-1 text-center text-3xl text-white">Compare</h1>
    <p class="mb-8 text-center text-sm text-stone-400">
      Pick two legends and settle the argument.
    </p>

    <!-- Selections live in the URL (?a=…&b=…), which the prerendered HTML
         can't know — so everything below renders client-side only. -->
    <ClientOnly>
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PlayerPicker v-model="aSlug" :players="identities ?? []" placeholder="First player…" />
        <span class="heading text-xl text-stone-600">VS</span>
        <PlayerPicker v-model="bSlug" :players="identities ?? []" placeholder="Second player…" />
      </div>

      <div v-if="ready" class="mt-8 space-y-8">
        <!-- The two contenders -->
        <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <NuxtLink v-for="(p, i) in [a!, b!]" :key="p.slug" :to="p.path" :style="{ gridColumn: i === 0 ? 1 : 3 }" class="group text-center">
            <div class="holo-ring mx-auto w-fit rounded-full p-[2px]">
              <NuxtImg
                v-if="p.image"
                :src="p.image"
                :alt="p.name"
                format="webp"
                width="160"
                height="160"
                class="h-24 w-24 rounded-full object-cover object-top sm:h-28 sm:w-28"
              />
            </div>
            <p class="mt-2 font-display text-lg leading-tight text-white transition group-hover:text-orange-300">
              {{ p.name }}
            </p>
            <p class="text-xs text-stone-500">#{{ p.rank }} · {{ years(i === 0 ? aStats : bStats) }}</p>
          </NuxtLink>
        </div>

        <!-- Career per game -->
        <section class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 class="heading mb-3 text-center text-sm text-stone-400">Career per game</h2>
          <div
            v-for="row in careerRows"
            :key="row.label"
            class="grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/5 py-1.5 text-sm last:border-0"
          >
            <span
              class="tabular-nums"
              :class="winner(row) === 'a' ? 'font-bold text-orange-300' : 'text-stone-300'"
            >
              {{ fmtVal(row.get(aStats), row.fmt) }}
            </span>
            <span class="px-4 text-center text-xs uppercase tracking-wider text-stone-500">
              {{ row.label }}
            </span>
            <span
              class="text-right tabular-nums"
              :class="winner(row) === 'b' ? 'font-bold text-orange-300' : 'text-stone-300'"
            >
              {{ fmtVal(row.get(bStats), row.fmt) }}
            </span>
          </div>
        </section>

        <!-- Accolades -->
        <section class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 class="heading mb-3 text-center text-sm text-stone-400">Accolades</h2>
          <div
            v-for="row in accoladeRows"
            :key="row.label"
            class="grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/5 py-1.5 text-sm last:border-0"
          >
            <span
              class="tabular-nums"
              :class="winner(row) === 'a' ? 'font-bold text-amber-300' : 'text-stone-300'"
            >
              {{ fmtVal(row.get(aStats), row.fmt) }}
            </span>
            <span class="px-4 text-center text-xs uppercase tracking-wider text-stone-500">
              {{ row.label }}
            </span>
            <span
              class="text-right tabular-nums"
              :class="winner(row) === 'b' ? 'font-bold text-amber-300' : 'text-stone-300'"
            >
              {{ fmtVal(row.get(bStats), row.fmt) }}
            </span>
          </div>
        </section>

        <!-- Share -->
        <div class="text-center">
          <button
            type="button"
            class="rounded-full border border-orange-400/50 bg-orange-500/10 px-5 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500 hover:text-stone-950"
            @click="share"
          >
            {{ copied ? '✓ Link copied!' : 'Copy link to this matchup' }}
          </button>
          <p class="mt-2 text-xs text-stone-500">The URL encodes the matchup — share it anywhere.</p>
        </div>
      </div>

      <p v-else class="mt-12 text-center text-sm text-stone-500">
        Choose two players to see the head-to-head.
      </p>
    </ClientOnly>
  </div>
</template>
