<script setup lang="ts">
// Companion icons to TrophyIcon, in the same flat-gradient style but stepped
// down the "metal" hierarchy: silver banner (conference), bronze shield
// (division), steel bracket (playoffs).
defineProps<{ type: 'banner' | 'shield' | 'bracket' }>()
</script>

<template>
  <!-- Conference: a rafter banner with a notched tail -->
  <svg v-if="type === 'banner'" viewBox="0 0 40 48" class="inline-block" aria-hidden="true">
    <defs>
      <linearGradient id="acc-silver" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="55%" stop-color="#94a3b8" />
        <stop offset="100%" stop-color="#475569" />
      </linearGradient>
    </defs>
    <rect x="6" y="3" width="28" height="3" rx="1.5" fill="url(#acc-silver)" />
    <path d="M9,8 H31 V42 L20,34.5 L9,42 Z" fill="url(#acc-silver)" />
    <circle cx="20" cy="18" r="4.5" fill="#1c1917" opacity="0.45" />
  </svg>

  <!-- Division: a crest shield -->
  <svg v-else-if="type === 'shield'" viewBox="0 0 40 48" class="inline-block" aria-hidden="true">
    <defs>
      <linearGradient id="acc-bronze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fcd9b6" />
        <stop offset="55%" stop-color="#b45309" />
        <stop offset="100%" stop-color="#7c2d12" />
      </linearGradient>
    </defs>
    <path
      d="M20,6 L31.5,10.5 V22.5 C31.5,31.5 26.5,37.5 20,41 C13.5,37.5 8.5,31.5 8.5,22.5 V10.5 Z"
      fill="url(#acc-bronze)"
    />
    <path
      d="M20,13.5 L21.9,17.6 26.2,18.1 23,21.1 23.9,25.3 20,23.2 16.1,25.3 17,21.1 13.8,18.1 18.1,17.6 Z"
      fill="#1c1917"
      opacity="0.45"
    />
  </svg>

  <!-- Playoffs: a single-elimination bracket -->
  <svg v-else viewBox="0 0 40 48" class="inline-block" aria-hidden="true">
    <defs>
      <linearGradient id="acc-steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#bae6fd" />
        <stop offset="60%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#1e40af" />
      </linearGradient>
    </defs>
    <g stroke="url(#acc-steel)" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6,13 H15.5 V24 H25" />
      <path d="M6,35 H15.5 V24" />
      <path d="M25,24 H33.5" />
    </g>
    <circle cx="33.5" cy="24" r="3" fill="url(#acc-steel)" />
  </svg>
</template>
