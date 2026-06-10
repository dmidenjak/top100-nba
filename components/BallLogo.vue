<template>
  <!-- A basketball drawn as inline SVG. It stands in for the final "0" of
       "100" in the site wordmark. Size it from the outside with a class
       (e.g. h-[0.9em]) — width follows via the aspect ratio. -->
  <svg viewBox="0 0 100 100" class="inline-block" aria-hidden="true">
    <defs>
      <linearGradient id="logo-ball" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>
      <!-- Same amber → orange → red leather ramp as the card rings. -->
      <linearGradient id="logo-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fcd34d" />
        <stop offset="50%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#b91c1c" />
      </linearGradient>
      <clipPath id="logo-clip">
        <circle cx="50" cy="50" r="38" />
      </clipPath>
    </defs>

    <!-- Holo ring around the ball -->
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#logo-ring)" stroke-width="5" />

    <!-- Ball body -->
    <circle cx="50" cy="50" r="38" fill="url(#logo-ball)" />

    <!-- Seams, clipped to the ball -->
    <g
      clip-path="url(#logo-clip)"
      stroke="#1c1917"
      stroke-width="3.5"
      fill="none"
      stroke-linecap="round"
    >
      <path d="M12,50 H88" />
      <path d="M50,12 V88" />
      <path d="M24,20 C42,38 42,62 24,80" />
      <path d="M76,20 C58,38 58,62 76,80" />
    </g>
  </svg>
</template>
