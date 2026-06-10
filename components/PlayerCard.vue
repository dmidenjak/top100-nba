<script setup lang="ts">
const props = defineProps<{
  rank: number
  name: string
  team?: string
  image?: string
  to: string
  dimmed?: boolean
}>()

// Initials shown when a player has no portrait image.
const initials = computed(() =>
  props.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
)
</script>

<template>
  <NuxtLink :to="to" class="group block">
    <!-- Leather-gradient border: an outer gradient div with 2px padding,
         revealing the ring around the inner dark card. -->
    <div
      class="holo-ring rounded-2xl p-[2px] shadow-lg shadow-black/40 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-orange-500/25"
      :class="{ 'opacity-40 grayscale': dimmed }"
    >
      <div class="overflow-hidden rounded-[14px] bg-stone-900">
        <div class="relative aspect-[3/4]">
          <!-- Rank badge -->
          <span
            class="absolute left-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-display text-lg font-bold text-stone-950 shadow-md"
          >
            {{ rank }}
          </span>

          <!-- Portrait, or initials fallback -->
          <NuxtImg
            v-if="image"
            :src="image"
            :alt="name"
            loading="lazy"
            format="webp"
            sizes="50vw sm:33vw md:25vw lg:240px"
            class="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-800 to-stone-700"
          >
            <span class="font-display text-4xl font-bold text-stone-500">{{ initials }}</span>
          </div>

          <!-- Name banner -->
          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-transparent p-3 pt-12"
          >
            <p class="heading text-base leading-tight text-white">{{ name }}</p>
            <p v-if="team" class="mt-0.5 text-xs font-medium text-orange-300/90">{{ team }}</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
