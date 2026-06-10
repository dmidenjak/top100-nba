// Downloads each franchise's SVG logo into public/logos/<teamId>.svg, for
// every unique team id found in data/stats.json. Run after `npm run sync`.
//
//   npm run logos
//
// Safe to re-run: existing files are skipped. Logos come from the NBA's CDN
// (cdn.nba.com) but are committed locally, same policy as player portraits.
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SNAPSHOT = join(__dirname, '..', 'data', 'stats.json')
const OUT_DIR = join(__dirname, '..', 'public', 'logos')

const snapshot = JSON.parse(await fs.readFile(SNAPSHOT, 'utf-8'))
const ids = new Set()
for (const entry of Object.values(snapshot)) {
  for (const t of entry.teams ?? []) ids.add(t.id)
}

await fs.mkdir(OUT_DIR, { recursive: true })
let downloaded = 0
let skipped = 0
const failed = []

for (const id of [...ids].sort()) {
  const file = join(OUT_DIR, `${id}.svg`)
  try {
    await fs.access(file)
    skipped++
    continue
  } catch {
    // not downloaded yet
  }

  try {
    const res = await fetch(`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await fs.writeFile(file, Buffer.from(await res.arrayBuffer()))
    downloaded++
    process.stdout.write(`  ✓ ${id}.svg\n`)
  } catch (err) {
    failed.push(`${id} (${err.message})`)
    process.stdout.write(`  ✗ ${id} — ${err.message}\n`)
  }
  await new Promise((r) => setTimeout(r, 300))
}

console.log(`\ndownloaded: ${downloaded}, skipped: ${skipped}, failed: ${failed.length}`)
for (const f of failed) console.log(`   - ${f}`)
