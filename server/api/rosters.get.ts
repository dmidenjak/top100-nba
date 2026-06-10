import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// Which top-100 players suited up for each franchise, with their tenure:
//   { [teamId]: [{ slug, from, to }, …] }  — sorted by arrival year.
// Derived from the committed snapshot; read at build time by the team pages.
export default defineEventHandler(async () => {
  try {
    const file = join(process.cwd(), 'data', 'stats.json')
    const snapshot = JSON.parse(await fs.readFile(file, 'utf-8')) as Record<string, any>

    const rosters: Record<string, { slug: string; from: number; to: number }[]> = {}
    for (const [slug, entry] of Object.entries(snapshot)) {
      for (const t of entry.teams ?? []) {
        ;(rosters[t.id] ??= []).push({ slug, from: t.from, to: t.to })
      }
    }
    for (const list of Object.values(rosters)) list.sort((a, b) => a.from - b.from)
    return rosters
  } catch {
    return {}
  }
})
