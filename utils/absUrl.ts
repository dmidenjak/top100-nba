// Absolute URL for OG/social tags (scrapers require absolute image URLs).
// Falls back to the relative path when NUXT_PUBLIC_SITE_URL isn't set (dev).
// Call from component setup (it reads runtime config).
export function absUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  const base = useRuntimeConfig().public.siteUrl
  return base ? base.replace(/\/$/, '') + path : path
}
