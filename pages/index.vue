<script setup lang="ts">
// Fetch the player list AND the per-player summary (decades + accolades + years),
// then merge them so each player carries everything both views need.
const { data: players } = await useAsyncData('player-list', async () => {
  const [list, meta] = await Promise.all([
    queryContent('/players').only(['rank', 'name', 'team', 'image', '_path']).find(),
    $fetch<Record<string, any>>('/api/list-meta'),
  ])
  return list
    .map((p) => ({ ...p, decades: [], ...(meta[p._path?.split('/').pop() ?? ''] ?? {}) }))
    .sort((a, b) => Number(a.rank) - Number(b.rank))
})

// --- view toggle: card grid vs. compact table ---
const view = ref<'cards' | 'table'>('cards')

// --- era filter (works in both views) ---
const decades = computed(() => {
  const set = new Set<number>()
  for (const p of players.value ?? []) for (const d of p.decades) set.add(d)
  return [...set].sort((a, b) => a - b)
})
const selected = ref<number[]>([])
function toggle(d: number) {
  selected.value = selected.value.includes(d)
    ? selected.value.filter((x: number) => x !== d)
    : [...selected.value, d]
}
function isDimmed(p: { decades: number[] }) {
  return selected.value.length > 0 && !p.decades.some((d) => selected.value.includes(d))
}

// --- search ---
const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// Accent- and punctuation-insensitive: "jok" must match "Jokić", "gino" must
// match "Ginóbili", and "oneal" must match "O'Neal".
function fold(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’.\-\s]/g, '')
    .toLowerCase()
}

// Pressing "/" anywhere focuses the search box (like GitHub/YouTube).
function onSlash(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault()
    searchInput.value?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onSlash))
onBeforeUnmount(() => window.removeEventListener('keydown', onSlash))

// Players enriched with a reactive `dimmed` flag, shared by both views.
const decorated = computed(() =>
  (players.value ?? []).map((p) => ({ ...p, dimmed: isDimmed(p) }))
)

// Search narrows the list (era filter dims; search hides).
const visible = computed(() => {
  const q = fold(query.value.trim())
  if (!q) return decorated.value
  return decorated.value.filter((p) => fold(p.name).includes(q))
})

// Enter jumps straight to the player when the search has exactly one match.
function onEnter() {
  if (visible.value.length === 1) navigateTo(visible.value[0]._path)
}

function pillClass(active: boolean) {
  return active
    ? 'border-orange-500 bg-orange-500 text-stone-950'
    : 'border-white/15 text-stone-300 hover:border-orange-300/50 hover:text-white'
}
function segClass(active: boolean) {
  return active ? 'bg-orange-500 text-stone-950' : 'text-stone-300 hover:text-white'
}
</script>

<template>
  <div>
    <!-- Stat leaders strip -->
    <LeadersStrip v-if="players" :players="players" />

    <!-- Search -->
    <div class="mx-auto mb-6 max-w-md">
      <div class="relative">
        <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500">🔍</span>
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          placeholder="Search players…  (press / to focus)"
          class="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pl-11 pr-10 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-orange-400/60 focus:bg-white/10"
          @keydown.enter="onEnter"
        />
        <button
          v-if="query"
          type="button"
          aria-label="Clear search"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-1.5 text-stone-500 transition hover:text-orange-300"
          @click="query = ''"
        >
          ✕
        </button>
      </div>
      <p v-if="query" class="mt-2 text-center text-xs text-stone-500">
        {{ visible.length }} of {{ players?.length }} players
        <span v-if="visible.length === 1"> — press Enter to open</span>
      </p>
    </div>

    <!-- View toggle + compare -->
    <div class="mb-6 flex items-center justify-center gap-3">
      <div class="inline-flex rounded-full border border-white/15 p-1">
        <button
          type="button"
          class="rounded-full px-5 py-1.5 text-sm font-medium transition"
          :class="segClass(view === 'cards')"
          @click="view = 'cards'"
        >
          Cards
        </button>
        <button
          type="button"
          class="rounded-full px-5 py-1.5 text-sm font-medium transition"
          :class="segClass(view === 'table')"
          @click="view = 'table'"
        >
          Table
        </button>
      </div>

      <NuxtLink
        to="/compare"
        class="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-stone-300 transition hover:border-orange-300/50 hover:text-orange-300"
      >
        Compare ⚔
      </NuxtLink>

      <NuxtLink
        to="/teams"
        class="rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-stone-300 transition hover:border-orange-300/50 hover:text-orange-300"
      >
        Teams 🏟
      </NuxtLink>
    </div>

    <!-- Era filter -->
    <div class="mb-8 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
        :class="pillClass(selected.length === 0)"
        @click="selected = []"
      >
        All eras
      </button>
      <button
        v-for="d in decades"
        :key="d"
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
        :class="pillClass(selected.includes(d))"
        @click="toggle(d)"
      >
        {{ d }}s
      </button>
    </div>

    <!-- Card grid -->
    <ul
      v-if="view === 'cards'"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-6"
    >
      <li v-for="player in visible" :key="player._path">
        <PlayerCard
          :rank="player.rank"
          :name="player.name"
          :team="player.team"
          :image="player.image"
          :to="player._path!"
          :dimmed="player.dimmed"
        />
      </li>
    </ul>

    <!-- Compact table -->
    <PlayerTable v-else-if="visible.length" :players="visible" />

    <!-- Empty state -->
    <p v-if="!visible.length" class="py-16 text-center text-stone-500">
      No players match “{{ query }}”.
    </p>
  </div>
</template>
