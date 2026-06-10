import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
    './content/**/*.md',
    // awardColors.ts defines Tailwind classes — must be scanned too.
    './utils/**/*.{js,ts}',
  ],
  // Fonts/animations are defined directly in assets/css/tailwind.css, so the
  // only thing the config needs to add is the typography plugin (the `prose`
  // classes used to format Markdown bios).
  plugins: [typography],
}
