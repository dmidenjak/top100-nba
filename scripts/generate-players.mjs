// Generates content/players/<slug>.md for every player in players-data.mjs,
// pulling a SHORT bio + portrait from Wikipedia's REST summary endpoint.
//
//   node scripts/generate-players.mjs          # create missing files
//   node scripts/generate-players.mjs --force  # also overwrite existing ones
//
// Existing files are skipped by default, so bios you've edited by hand are safe.
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { players } from './players-data.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'content', 'players')
const FORCE = process.argv.includes('--force')

// Wikipedia asks API clients to send a descriptive User-Agent.
const UA = 'top100-nba (learning project)'

// "Larry Bird" -> "larry-bird", "Shaquille O'Neal" -> "shaquille-oneal"
function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/['’.]/g, '')          // drop apostrophes & periods
    .replace(/[^a-z0-9]+/g, '-')    // anything else -> hyphen
    .replace(/^-+|-+$/g, '')
}

// JSON's double-quoted strings are valid YAML, so this safely quotes any value.
const yaml = (s) => JSON.stringify(s)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Fetch the short summary for one Wikipedia article title.
// Retries on HTTP 429 (rate limit) with exponential backoff.
async function fetchSummary(title, attempt = 0) {
  const url =
    'https://en.wikipedia.org/api/rest_v1/page/summary/' +
    encodeURIComponent(title.replace(/ /g, '_'))
  const res = await fetch(url, { headers: { 'User-Agent': UA } })

  if (res.status === 429 && attempt < 5) {
    const retryAfter = Number(res.headers.get('retry-after')) || 0
    const wait = Math.max(retryAfter * 1000, 2000 * 2 ** attempt) // 2s,4s,8s,16s,32s
    process.stdout.write(`    …rate limited, waiting ${wait / 1000}s\n`)
    await sleep(wait)
    return fetchSummary(title, attempt + 1)
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.type === 'disambiguation') throw new Error('disambiguation page')
  return data
}

function buildMarkdown({ rank, name, image, bio }) {
  const frontmatter = [
    '---',
    `rank: ${rank}`,
    `name: ${yaml(name)}`,
    `slug: ${slugify(name)}`,
    `image: ${yaml(image || '')}`,
    '# Optional — fill these in to enrich the page:',
    'nickname:',
    'team:',
    'number:',
    'position:',
    '# Add a balldontlie player ID to load live metadata (see larry-bird.md).',
    'balldontlieId:',
    '# Uncomment + fill to show the STATS box:',
    "# seasonStats:",
    "#   - { season: 'Career', gp: 0, ppg: 0, rpg: 0, apg: 0 }",
    '---',
    '',
  ].join('\n')
  return frontmatter + bio.trim() + '\n'
}

const created = []
const skipped = []
const failed = []

await fs.mkdir(OUT_DIR, { recursive: true })

for (const [index, player] of players.entries()) {
  const slug = slugify(player.name)
  const file = join(OUT_DIR, `${slug}.md`)

  if (!FORCE) {
    try {
      await fs.access(file)
      skipped.push(slug)
      continue
    } catch {
      // doesn't exist yet — go fetch it
    }
  }

  try {
    const summary = await fetchSummary(player.wiki || player.name)
    const md = buildMarkdown({
      rank: index + 1,
      name: player.name,
      image: summary.thumbnail?.source || summary.originalimage?.source || '',
      bio: summary.extract || '',
    })
    await fs.writeFile(file, md, 'utf-8')
    created.push(slug)
    process.stdout.write(`  ✓ ${slug}\n`)
  } catch (err) {
    failed.push(`${player.name} (${err.message})`)
    process.stdout.write(`  ✗ ${player.name} — ${err.message}\n`)
  }

  // Be polite to Wikipedia.
  await sleep(1000)
}

console.log('\n--- summary ---')
console.log(`created: ${created.length}`)
console.log(`skipped (already existed): ${skipped.length}`)
if (failed.length) {
  console.log(`failed: ${failed.length}`)
  for (const f of failed) console.log(`   - ${f}`)
  console.log('\nFix failures by adding a `wiki:` override in players-data.mjs, then re-run.')
}
