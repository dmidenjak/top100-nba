<script setup lang="ts">
defineProps<{
  teams: Array<{
    id: number
    abbr: string
    name?: string | null
    from: number
    to: number
  }>
}>()

// Map franchise id -> team page path (/teams/boston-celtics). Shared cache key,
// so this is fetched once no matter how many player pages you visit. Defunct
// franchises (no page) simply aren't in the map and render unlinked.
const { data: teamPages } = await useAsyncData('team-page-map', async () => {
  const list = await queryContent('/teams').only(['nbaId', '_path']).find()
  return Object.fromEntries(list.map((t) => [String(t.nbaId), t._path as string]))
})
const pageFor = (id: number) => teamPages.value?.[String(id)] ?? null

// <component :is> needs the actual component, not the string "NuxtLink".
const NuxtLinkComp = resolveComponent('NuxtLink')

// Logos that failed to load (defunct franchises) fall back to an abbr chip.
const failedLogos = ref<Set<number>>(new Set())
function onLogoError(id: number) {
  failedLogos.value = new Set(failedLogos.value).add(id)
}
</script>

<template>
  <section v-if="teams.length" class="rounded-2xl border border-white/10 bg-white/5 p-5">
    <h2 class="heading mb-4 text-sm text-stone-400">Teams</h2>
    <ul class="space-y-2.5">
      <li v-for="t in teams" :key="t.id + '-' + t.from">
        <component
          :is="pageFor(t.id) ? NuxtLinkComp : 'div'"
          v-bind="pageFor(t.id) ? { to: pageFor(t.id) } : {}"
          class="group flex items-center gap-3"
        >
          <!-- Logos are downloaded locally by `npm run logos`. Defunct franchises
               without a logo get an abbreviation chip instead. -->
          <img
            v-if="!failedLogos.has(t.id)"
            :src="`/logos/${t.id}.svg`"
            :alt="t.name ?? t.abbr"
            loading="lazy"
            class="h-8 w-8 shrink-0 object-contain"
            @error="onLogoError(t.id)"
          />
          <span
            v-else
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[9px] font-bold text-stone-400"
          >
            {{ t.abbr }}
          </span>
          <div class="min-w-0">
            <p
              class="truncate text-sm font-medium text-stone-100"
              :class="pageFor(t.id) ? 'transition group-hover:text-orange-300' : ''"
            >
              {{ t.name ?? t.abbr }}
            </p>
            <p class="text-xs tabular-nums text-stone-500">{{ t.from }}–{{ t.to }}</p>
          </div>
        </component>
      </li>
    </ul>
  </section>
</template>
