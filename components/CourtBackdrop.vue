<template>
  <!-- Decorative court line-art, fixed behind all content. pointer-events-none
       so it never blocks clicks; aria-hidden so screen readers skip it. -->
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <!-- ====== Perspective half-court along the bottom ====== -->
    <svg
      viewBox="0 0 1200 500"
      class="absolute bottom-0 left-1/2 w-full min-w-[900px] max-w-[1600px] -translate-x-1/2"
      fill="none"
      stroke="#fdba74"
      stroke-width="1.5"
      opacity="0.07"
    >
      <!-- Sidelines receding to the far baseline -->
      <path d="M40,500 L450,80" />
      <path d="M1160,500 L750,80" />
      <!-- Far baseline -->
      <path d="M450,80 H750" />
      <!-- The key (paint), in perspective -->
      <path d="M552,80 L532,205 M648,80 L668,205 M532,205 H668" />
      <!-- Free-throw circle -->
      <ellipse cx="600" cy="205" rx="62" ry="15" />
      <!-- Three-point arc -->
      <path d="M488,80 C490,260 710,260 712,80" />
      <!-- Backboard + rim at the basket -->
      <path d="M576,52 H624" stroke-width="2.5" />
      <ellipse cx="600" cy="68" rx="13" ry="4" />
      <!-- Half-court circle rising from the bottom edge -->
      <ellipse cx="600" cy="512" rx="230" ry="60" />
      <ellipse cx="600" cy="512" rx="60" ry="16" />
    </svg>

    <!-- ====== Streetball hoop, top right, cropped off-screen ====== -->
    <svg
      viewBox="0 0 200 260"
      class="absolute -right-8 top-16 hidden h-80 rotate-6 lg:block"
      fill="none"
      stroke="#fdba74"
      stroke-width="1.5"
      opacity="0.08"
    >
      <!-- Backboard with inner target square -->
      <rect x="20" y="10" width="160" height="100" rx="6" />
      <rect x="73" y="48" width="54" height="42" rx="2" />
      <!-- Rim -->
      <ellipse cx="100" cy="118" rx="34" ry="9" stroke-width="2.5" />
      <!-- Net: strands tapering in, with two rings -->
      <path d="M68,122 C74,150 86,172 96,190" />
      <path d="M84,126 C88,152 94,174 99,191" />
      <path d="M100,127 C100,152 100,174 100,192" />
      <path d="M116,126 C112,152 106,174 101,191" />
      <path d="M132,122 C126,150 114,172 104,190" />
      <ellipse cx="100" cy="150" rx="25" ry="6.5" />
      <ellipse cx="100" cy="175" rx="15" ry="4.5" />
    </svg>
  </div>
</template>
