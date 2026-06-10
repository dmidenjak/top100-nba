// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // Modules are Nuxt's plugin system. These two add Markdown content
  // handling (@nuxt/content) and Tailwind CSS to the project.
  // Tailwind's own config lives in tailwind.config.js.
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/image'],

  css: ['~/assets/css/tailwind.css'],

  // @nuxt/image: optimise/serve responsive, modern-format images.
  // The default 'ipx' provider optimises local files in public/. During
  // `nuxt generate` the optimised variants are prerendered to static files.
  image: {
    format: ['webp'],
    quality: 70,
  },

  app: {
    head: {
      title: 'TOP 100 — NBA',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  content: {
    // Pretty code blocks etc. in Markdown bios.
    highlight: {
      theme: 'github-light',
    },
  },
})
