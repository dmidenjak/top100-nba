import { serverQueryContent } from '#content/server'

// sitemap.xml generated from the actual content, so new players/teams are
// included automatically. Prerendered into the static output (see nuxt.config).
// URLs are absolute only when NUXT_PUBLIC_SITE_URL is set (deploy time).
export default defineEventHandler(async (event) => {
  const base = (useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')

  const players = await serverQueryContent(event, '/players').only(['_path']).find()
  const teams = await serverQueryContent(event, '/teams').only(['_path']).find()

  const paths = [
    '/',
    '/compare',
    '/teams',
    '/records',
    ...players.flatMap((p) => [p._path!, `${p._path}/stats`]),
    ...teams.map((t) => t._path!),
  ]

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n') +
    '\n</urlset>'

  setHeader(event, 'content-type', 'application/xml')
  return xml
})
