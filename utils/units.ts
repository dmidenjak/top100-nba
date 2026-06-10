// Files in utils/ are auto-imported by Nuxt, so these can be used in any
// component/page without an import line.

// NBA height comes as feet-inches, e.g. "6-6". Render imperial + metric.
//   "6-6" -> `6'6" (198 cm)`
export function formatHeight(h?: string | null): string | null {
  if (!h) return null
  const [ft, inch] = h.split('-').map((n) => parseInt(n, 10))
  if (Number.isNaN(ft)) return h
  const inches = ft * 12 + (inch || 0)
  const cm = Math.round(inches * 2.54)
  return `${ft}'${inch || 0}" (${cm} cm)`
}

// NBA weight comes as pounds, e.g. "216". Render lb + kg.
//   "216" -> `216 lb (98 kg)`
export function formatWeight(w?: string | number | null): string | null {
  if (w === null || w === undefined || w === '') return null
  const lb = Number(w)
  if (Number.isNaN(lb)) return String(w)
  const kg = Math.round(lb * 0.453592)
  return `${lb} lb (${kg} kg)`
}
