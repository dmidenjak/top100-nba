// Stamps the ranking into every content/players/*.md based on the ORDER of the
// list in players-data.mjs (position 0 -> rank 1, position 1 -> rank 2, ...).
//
//   npm run rank
//
// So to reorder the site: move lines around in scripts/players-data.mjs, then
// run this. It rewrites only the `rank:` line of each file, leaving everything
// else (bio, image, stats) untouched.
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { players } from './players-data.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content', 'players')

function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

let updated = 0
const missing = []

for (const [index, player] of players.entries()) {
  const rank = index + 1
  const slug = slugify(player.name)
  const file = join(CONTENT_DIR, `${slug}.md`)

  let md
  try {
    md = await fs.readFile(file, 'utf-8')
  } catch {
    missing.push(`${player.name} (no ${slug}.md)`)
    continue
  }

  // Replace the existing `rank:` line in the frontmatter.
  if (/^rank:.*$/m.test(md)) {
    const next = md.replace(/^rank:.*$/m, `rank: ${rank}`)
    if (next !== md) {
      await fs.writeFile(file, next, 'utf-8')
      updated++
    }
  } else {
    missing.push(`${player.name} (no 'rank:' line in ${slug}.md)`)
  }
}

console.log(`✓ ranked ${players.length} players (updated ${updated} files)`)
if (missing.length) {
  console.log(`⚠ ${missing.length} issue(s):`)
  for (const m of missing) console.log(`   - ${m}`)
}
