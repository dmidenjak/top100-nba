import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// Per-player summary for the homepage, derived from data/stats.json:
//   decades  → which decades they played (for the era filter)
//   titles / mvp / dpoy → accolade counts (for the table view)
//   fromYear / toYear    → years active span (for the table view)
//
// Read at build time by the homepage.
export default defineEventHandler(async () => {
  try {
    const file = join(process.cwd(), 'data', 'stats.json')
    const snapshot = JSON.parse(await fs.readFile(file, 'utf-8')) as Record<string, any>

    const meta: Record<string, any> = {}
    for (const [slug, entry] of Object.entries(snapshot)) {
      const startYears: number[] = []
      for (const row of entry.seasonStats ?? []) {
        if (/career/i.test(row.season)) continue
        const year = String(row.season).match(/^(\d{4})/)?.[1]
        if (year) startYears.push(Number(year))
      }
      const decades = [...new Set(startYears.map((y) => Math.floor(y / 10) * 10))].sort((a, b) => a - b)
      const aw = entry.awards ?? {}
      const career = (entry.seasonStats ?? []).find((r: any) => /career/i.test(r.season))

      meta[slug] = {
        decades,
        titles: aw.championships ?? 0,
        mvp: aw.mvp ?? 0,
        dpoy: aw.dpoy ?? 0,
        allStar: aw.allStar ?? 0,
        // Career per-game averages (for the leaders strip).
        ppg: career?.ppg ?? null,
        rpg: career?.rpg ?? null,
        apg: career?.apg ?? null,
        // NBA seasons span two calendar years, so the last season ends startYear + 1.
        fromYear: startYears.length ? Math.min(...startYears) : null,
        toYear: startYears.length ? Math.max(...startYears) + 1 : null,
      }
    }
    return meta
  } catch {
    return {}
  }
})
