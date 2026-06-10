import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// Everything the compare tool needs for every player, in one response:
// career per-game line, accolade counts, and years active. Fetched once at
// build time by /compare and baked into the static payload (~tens of KB).
export default defineEventHandler(async () => {
  try {
    const file = join(process.cwd(), 'data', 'stats.json')
    const snapshot = JSON.parse(await fs.readFile(file, 'utf-8')) as Record<string, any>

    const out: Record<string, any> = {}
    for (const [slug, e] of Object.entries(snapshot)) {
      const career = (e.seasonStats ?? []).find((r: any) => /career/i.test(r.season)) ?? null
      const startYears = (e.seasonStats ?? [])
        .filter((r: any) => !/career/i.test(r.season))
        .map((r: any) => parseInt(r.season))
        .filter(Number.isFinite)
      const aw = e.awards ?? {}

      out[slug] = {
        career,
        awards: {
          championships: aw.championships ?? 0,
          mvp: aw.mvp ?? 0,
          finalsMvp: aw.finalsMvp ?? 0,
          dpoy: aw.dpoy ?? 0,
          allStar: aw.allStar ?? 0,
          allNba:
            (aw.allNba?.first ?? 0) + (aw.allNba?.second ?? 0) + (aw.allNba?.third ?? 0),
        },
        fromYear: startYears.length ? Math.min(...startYears) : null,
        toYear: startYears.length ? Math.max(...startYears) + 1 : null,
      }
    }
    return out
  } catch {
    return {}
  }
})
