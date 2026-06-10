<script setup lang="ts">
// Franchise all-time statistical leaders (career totals with this franchise),
// themed by the team's colors. Leaders who are in the Top 100 link to their
// player page.
defineProps<{
  leaders: Record<string, { player?: string | null; value?: number | null; slug?: string | null }>
}>()

const labels: Record<string, string> = {
  pts: 'Points',
  reb: 'Rebounds',
  ast: 'Assists',
  stl: 'Steals',
  blk: 'Blocks',
}

const NuxtLinkComp = resolveComponent('NuxtLink')
</script>

<template>
  <section class="team-border team-tint rounded-2xl border p-5">
    <h2 class="heading mb-4 text-sm text-stone-400">Franchise leaders</h2>
    <ul class="space-y-2">
      <li
        v-for="(key, _) in Object.keys(labels).filter((k) => leaders[k])"
        :key="key"
        class="flex items-baseline justify-between gap-3 text-sm"
      >
        <span class="text-xs uppercase tracking-wider text-stone-500">{{ labels[key] }}</span>
        <span class="min-w-0 flex-1 border-b border-dotted border-white/10" />
        <component
          :is="leaders[key].slug ? NuxtLinkComp : 'span'"
          v-bind="leaders[key].slug ? { to: `/players/${leaders[key].slug}` } : {}"
          class="truncate font-medium text-stone-100"
          :class="leaders[key].slug ? 'transition hover:text-orange-300 hover:underline' : ''"
        >
          {{ leaders[key].player }}
        </component>
        <span class="tabular-nums font-semibold" :style="{ color: 'var(--t2)' }">
          {{ leaders[key].value?.toLocaleString('en-US') }}
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.team-border {
  border-color: color-mix(in srgb, var(--t1) 45%, white 8%);
}
.team-tint {
  background: color-mix(in srgb, var(--t1) 10%, transparent);
}
</style>
