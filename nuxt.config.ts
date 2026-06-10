// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  // Modules are Nuxt's plugin system. These two add Markdown content
  // handling (@nuxt/content) and Tailwind CSS to the project.
  // Tailwind's own config lives in tailwind.config.js.
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/image'],

  css: ['~/assets/css/tailwind.css'],

  // Public site URL, used to build absolute OG-image/sitemap URLs. Set the
  // NUXT_PUBLIC_SITE_URL env var at deploy time (e.g. https://yourdomain.com);
  // empty in dev, in which case OG images fall back to relative paths.
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
    },
  },

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
      meta: [
        {
          name: 'description',
          content:
            'The 100 greatest NBA players of all time — bios, career stats, accolades, team histories, and head-to-head comparisons.',
        },
        { property: 'og:site_name', content: 'TOP 100 — NBA' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
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

  // Make sure the SEO endpoints land in the static output (they aren't
  // discoverable by the link crawler).
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },

  content: {
    // Pretty code blocks etc. in Markdown bios.
    highlight: {
      theme: 'github-light',
    },
  },
})
