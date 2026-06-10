<template>
  <div class="min-h-screen">
    <CourtBackdrop />

    <header class="border-b border-orange-200/10">
      <div class="mx-auto max-w-6xl px-4 pb-0 pt-10 text-center">
        <NuxtLink to="/" class="group inline-block">
          <h1 class="heading flex items-center justify-center gap-1 text-5xl tracking-[0.12em] sm:text-6xl">
            <span class="bg-gradient-to-r from-amber-200 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              TOP&nbsp;10
            </span>
            <!-- The basketball is the final "0" of "100" -->
            <BallLogo
              class="h-[0.92em] w-[0.92em] transition-transform duration-700 ease-out group-hover:rotate-[360deg]"
            />
            <span class="sr-only">0</span>
          </h1>
        </NuxtLink>
        <p class="mt-2 text-sm uppercase tracking-[0.3em] text-stone-400">
          The greatest NBA players of all time
        </p>

        <!-- Center-court circle peeking through the header baseline -->
        <div class="mx-auto mt-6 h-7 w-24 rounded-t-full border-x border-t border-orange-200/15" />
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-10">
      <NuxtPage />
    </main>

    <footer class="border-t border-orange-200/10 py-8 text-center text-xs text-stone-500">
      Built with Nuxt · bios from Wikipedia · a learning project 🏀
    </footer>
  </div>
</template>
