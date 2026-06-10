import { promises as fs } from 'node:fs'
import { join } from 'node:path'

// The NBA's official all-time top-10 leaders, produced offline by
// `npm run sync:records` into the committed data/records.json.
export default defineEventHandler(async () => {
  try {
    const file = join(process.cwd(), 'data', 'records.json')
    return JSON.parse(await fs.readFile(file, 'utf-8'))
  } catch {
    return []
  }
})
