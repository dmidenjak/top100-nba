<script setup lang="ts">
// All franchises from content/teams, alphabetical.
const { data: teams } = await useAsyncData('team-list', () =>
  queryContent('/teams')
    .only(['name', 'abbr', 'logo', '_path'])
    .sort({ name: 1 })
    .find()
)

useSeoMeta({
  title: 'Teams — TOP 100',
  description:
    'All 30 NBA franchises — championships, retired numbers, and the all-time legends who wore each jersey.',
})
</script>

<template>
  <div>
    <h1 class="heading mb-1 text-center text-3xl text-white">Teams</h1>
    <p class="mb-8 text-center text-sm text-stone-400">
      The 30 NBA franchises — and the legends who wore their jerseys.
    </p>

    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <li v-for="team in teams" :key="team._path">
        <NuxtLink
          :to="team._path!"
          class="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition hover:-translate-y-1 hover:border-orange-300/40 hover:bg-white/10"
        >
          <img
            :src="team.logo"
            :alt="team.name"
            loading="lazy"
            class="h-24 w-24 object-contain transition duration-300 group-hover:scale-110"
          />
          <span class="text-sm font-medium text-stone-200 transition group-hover:text-orange-300">
            {{ team.name }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
