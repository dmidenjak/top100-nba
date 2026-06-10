import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// Franchise accolades map (titles, conference/division titles, playoff
// appearances, all-time record), keyed by team id. Produced offline by
// `npm run sync:teams` into the committed data/teams.json.
export default defineEventHandler(async () => {
  try {
    const file = join(process.cwd(), 'data', 'teams.json')
    return JSON.parse(await fs.readFile(file, 'utf-8'))
  } catch {
    return {}
  }
})
