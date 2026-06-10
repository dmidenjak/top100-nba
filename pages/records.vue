<script setup lang="ts">
type RecordRow = {
  rank: number
  name: string
  value: number
  active: boolean
  slug?: string | null
}
type Category = { key: string; label: string; rows: RecordRow[] }

const { data: records } = await useAsyncData('records', () =>
  $fetch<Category[]>('/api/records')
)

useSeoMeta({
  title: 'All-time records — TOP 100',
  description:
    "The NBA's official all-time top 10 in points, rebounds, assists, steals, blocks, threes, and games played.",
})
</script>

<template>
  <div>
    <h1 class="heading mb-1 text-center text-3xl text-white">All-time records</h1>
    <p class="mb-8 text-center text-sm text-stone-400">
      The NBA's official career top 10s. <span class="text-orange-300">Highlighted players</span>
      are in our Top 100.
    </p>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <section
        v-for="cat in records"
        :key="cat.key"
        class="rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <h2 class="heading mb-3 text-sm text-stone-400">{{ cat.label }}</h2>
        <ol class="space-y-1.5">
          <li
            v-for="row in cat.rows"
            :key="row.rank"
            class="flex items-baseline gap-2.5 text-sm"
          >
            <span class="w-5 shrink-0 text-right font-display text-stone-500">{{ row.rank }}</span>
            <NuxtLink
              v-if="row.slug"
              :to="`/players/${row.slug}`"
              class="min-w-0 flex-1 truncate font-medium text-orange-300 transition hover:text-orange-200 hover:underline"
            >
              {{ row.name }}<span v-if="row.active" class="ml-1 text-[10px] text-stone-500" title="Still active">●</span>
            </NuxtLink>
            <span v-else class="min-w-0 flex-1 truncate text-stone-300">
              {{ row.name }}<span v-if="row.active" class="ml-1 text-[10px] text-stone-500" title="Still active">●</span>
            </span>
            <span class="shrink-0 tabular-nums font-semibold text-stone-100">
              {{ row.value.toLocaleString('en-US') }}
            </span>
          </li>
        </ol>
      </section>
    </div>

    <p class="mt-6 text-center text-xs text-stone-500">
      ● still active · steals &amp; blocks recorded since 1973-74, threes since 1979-80
    </p>
  </div>
</template>
