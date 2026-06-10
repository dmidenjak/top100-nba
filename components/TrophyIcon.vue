<template>
  <!-- Simplified Larry O'Brien championship trophy: a basketball perched on a
       swooping net funnel over a pedestal, in a gold gradient. Size it from
       the outside with a class (e.g. h-6); width follows the aspect ratio. -->
  <svg viewBox="0 0 40 64" class="inline-block" aria-hidden="true">
    <defs>
      <linearGradient id="trophy-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fde68a" />
        <stop offset="55%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#92400e" />
      </linearGradient>
    </defs>

    <!-- Net funnel -->
    <path
      d="M8,21 C11,34 17,40 18.5,51 L21.5,51 C23,40 29,34 32,21 C28,27 24,29 20,29 C16,29 12,27 8,21 Z"
      fill="url(#trophy-gold)"
    />
    <!-- Pedestal -->
    <rect x="12" y="51" width="16" height="4" rx="1" fill="url(#trophy-gold)" />
    <rect x="8" y="56" width="24" height="6" rx="2" fill="url(#trophy-gold)" />

    <!-- Ball on top (drawn last so it sits in front of the net) -->
    <circle cx="20" cy="13" r="10" fill="url(#trophy-gold)" />
    <path
      d="M10,13 H30 M20,3 V23 M13,5.5 C17,10 17,16 13,20.5 M27,5.5 C23,10 23,16 27,20.5"
      stroke="#92400e"
      stroke-width="1.2"
      fill="none"
      opacity="0.55"
    />
  </svg>
</template>
