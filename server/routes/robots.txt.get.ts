// robots.txt with an absolute sitemap link when the site URL is configured.
export default defineEventHandler((event) => {
  const base = (useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain')
  return ['User-agent: *', 'Allow: /', ...(base ? [`Sitemap: ${base}/sitemap.xml`] : []), ''].join(
    '\n'
  )
})
