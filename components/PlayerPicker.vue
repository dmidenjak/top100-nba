<script setup lang="ts">
// A search-driven player selector. Supports v-model: the parent binds a slug
// (string | null); we emit 'update:modelValue' when the user picks or clears.
type P = { slug: string; name: string; rank: number; image?: string; team?: string }

const props = defineProps<{
  players: P[]
  modelValue: string | null
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string | null] }>()

const q = ref('')
const open = ref(false)

// Same accent/punctuation folding as the homepage search.
function fold(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’.\-\s]/g, '')
    .toLowerCase()
}

const selected = computed(() => props.players.find((p) => p.slug === props.modelValue) ?? null)

const matches = computed(() => {
  const f = fold(q.value.trim())
  const pool = f ? props.players.filter((p) => fold(p.name).includes(f)) : props.players
  return pool.slice(0, 8)
})

function pick(p: P) {
  emit('update:modelValue', p.slug)
  q.value = ''
  open.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Selected state: a small player chip with a clear button -->
    <div
      v-if="selected"
      class="flex items-center gap-3 rounded-2xl border border-orange-400/30 bg-white/5 p-3"
    >
      <NuxtImg
        v-if="selected.image"
        :src="selected.image"
        :alt="selected.name"
        format="webp"
        width="80"
        height="80"
        class="h-10 w-10 rounded-full object-cover object-top"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-stone-100">
          <span class="font-display text-stone-500">#{{ selected.rank }}</span>
          {{ selected.name }}
        </p>
        <p v-if="selected.team" class="truncate text-xs text-stone-500">{{ selected.team }}</p>
      </div>
      <button
        type="button"
        aria-label="Clear selection"
        class="rounded-full px-2 py-1 text-stone-500 transition hover:text-orange-300"
        @click="emit('update:modelValue', null)"
      >
        ✕
      </button>
    </div>

    <!-- Empty state: search input with a dropdown of matches -->
    <template v-else>
      <input
        v-model="q"
        type="search"
        :placeholder="placeholder ?? 'Search a player…'"
        class="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-orange-400/60 focus:bg-white/10"
        @focus="open = true"
        @blur="open = false"
      />
      <ul
        v-if="open && matches.length"
        class="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-stone-900 shadow-2xl shadow-black/50"
      >
        <li v-for="p in matches" :key="p.slug">
          <!-- mousedown.prevent: select before the input's blur closes the list -->
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5"
            @mousedown.prevent="pick(p)"
          >
            <NuxtImg
              v-if="p.image"
              :src="p.image"
              :alt="p.name"
              format="webp"
              width="64"
              height="64"
              class="h-8 w-8 rounded-full object-cover object-top"
            />
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium text-stone-100">
                <span class="font-display text-stone-500">#{{ p.rank }}</span>
                {{ p.name }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>
