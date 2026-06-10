import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// Returns the stats snapshot entry for one player (by slug), read from the
// committed data/stats.json. This decouples the site from the data source:
// the snapshot is produced offline by `npm run sync` (scripts/sync_stats.py,
// via nba_api), and the build/runtime only ever reads this local file.
//
// Returns null when the player isn't in the snapshot yet (e.g. before the first
// sync), and the page renders without stats.
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  try {
    const file = join(process.cwd(), 'data', 'stats.json')
    const snapshot = JSON.parse(await fs.readFile(file, 'utf-8'))
    return snapshot[slug!] ?? null
  } catch {
    return null
  }
})
