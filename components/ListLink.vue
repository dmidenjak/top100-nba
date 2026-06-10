<template>
  <!-- The "back to the big board" button, shared by all player sub-pages so
       it stays identical everywhere. -->
  <NuxtLink
    to="/"
    class="heading inline-flex shrink-0 items-center gap-2 rounded-full border border-orange-400/50 bg-orange-500/10 px-5 py-1.5 text-sm tracking-widest text-orange-300 transition hover:bg-orange-500 hover:text-stone-950"
  >
    <BallLogo class="h-4 w-4" />
    THE LIST
  </NuxtLink>
</template>
