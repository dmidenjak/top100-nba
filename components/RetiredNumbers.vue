<script setup lang="ts">
// "Numbers in the rafters" — the franchise's retired jerseys, themed by the
// team's colors (--t1/--t2 set by the team page). Honorees who are in the
// Top 100 carry a `path` and link to their player page. Non-number honorees
// exist too (the Celtics retired broadcaster Johnny Most's microphone).
defineProps<{
  retired: Array<{
    jersey?: string | null
    player?: string | null
    position?: string | null
    seasons?: string | null
    year?: number | null
    path?: string | null
  }>
}>()

function jerseyLabel(r: { jersey?: string | null; position?: string | null }) {
  if (r.jersey) return r.jersey
  return r.position === 'Broadcaster' ? '🎙' : '★'
}

// <component :is> needs the actual component, not the string "NuxtLink".
const NuxtLinkComp = resolveComponent('NuxtLink')
</script>

<template>
  <section v-if="retired.length" class="team-border team-tint rounded-2xl border p-5">
    <h2 class="heading mb-4 text-sm text-stone-400">
      Retired numbers · {{ retired.length }}
    </h2>
    <ul class="grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
      <li v-for="r in retired" :key="(r.jersey ?? '') + (r.player ?? '')">
        <component
          :is="r.path ? NuxtLinkComp : 'div'"
          v-bind="r.path ? { to: r.path } : {}"
          class="jersey relative flex aspect-[4/5] w-full flex-col items-center justify-center px-2 pt-3 text-center"
          :class="r.path ? 'tile-link transition hover:-translate-y-1' : ''"
          :title="`${r.player}${r.seasons ? ` · ${r.seasons}` : ''}${r.year ? ` · retired ${r.year}` : ''}`"
        >
          <p class="font-display text-2xl font-bold leading-none" :style="{ color: 'var(--t2)' }">
            {{ jerseyLabel(r) }}
          </p>
          <p class="mt-1 w-full truncate px-2.5 text-[10px] font-medium text-stone-300">{{ r.player }}</p>
          <p v-if="r.year" class="text-[10px] tabular-nums text-stone-500">{{ r.year }}</p>
        </component>
      </li>
    </ul>
    <p class="mt-3 text-[11px] text-stone-500">Highlighted tiles are Top 100 players.</p>
  </section>
</template>

<style scoped>
.team-border {
  border-color: color-mix(in srgb, var(--t1) 45%, white 8%);
}
.team-tint {
  background: color-mix(in srgb, var(--t1) 10%, transparent);
}
/* The tank-top silhouette: shoulder straps, a neckline dip, armhole notches,
   then straight down to the hem. clip-path also clips borders, so the jersey
   reads through its FILL — Top 100 players get a brighter team-colored fill. */
.jersey {
  clip-path: polygon(
    15% 0,
    35% 0,
    50% 13%,
    65% 0,
    85% 0,
    100% 16%,
    91% 30%,
    91% 100%,
    9% 100%,
    9% 30%,
    0 16%
  );
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--t1) 30%, #1c1917),
    #0e0d0c
  );
}
/* Tiles that link to a Top 100 player: brighter, team-secondary-tinted fill. */
.tile-link {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--t2) 30%, #1c1917),
    color-mix(in srgb, var(--t1) 35%, #0e0d0c)
  );
}
.tile-link:hover {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--t2) 45%, #1c1917),
    color-mix(in srgb, var(--t1) 50%, #0e0d0c)
  );
}
</style>
