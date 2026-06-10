// Generates content/teams/<slug>.md for every current NBA franchise found in
// data/stats.json, with a description pulled from the Wikipedia article INTRO
// (action API, exintro) — longer than the one-paragraph player summaries.
//
//   npm run teams            # create missing files
//   npm run teams -- --force # overwrite existing ones
//
// Resumable / safe to re-run: existing files are skipped, so hand-edited
// descriptions are never clobbered.
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SNAPSHOT = join(__dirname, '..', 'data', 'stats.json')
const LOGOS_DIR = join(__dirname, '..', 'public', 'logos')
const OUT_DIR = join(__dirname, '..', 'content', 'teams')
const FORCE = process.argv.includes('--force')
const UA = 'top100-nba (learning project)'

// Cap the intro at this many paragraphs — "brief, but longer than a player bio".
const MAX_PARAGRAPHS = 3

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const yaml = (s) => JSON.stringify(s)

// Wikipedia article intro (plain text), with retry/backoff on rate limits.
async function fetchIntro(title, attempt = 0) {
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts' +
    '&exintro=1&explaintext=1&redirects=1&titles=' +
    encodeURIComponent(title)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt < 5) {
    const wait = 2000 * 2 ** attempt
    process.stdout.write(`    …rate limited, waiting ${wait / 1000}s\n`)
    await sleep(wait)
    return fetchIntro(title, attempt + 1)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const pages = data.query?.pages ?? {}
  const page = Object.values(pages)[0]
  if (!page || page.missing !== undefined || !page.extract) throw new Error('no article found')
  return page.extract
}

// Collect the unique current franchises from the snapshot (a team is "current"
// when we have its logo on disk — this skips defunct ones like the Capitols).
const snapshot = JSON.parse(await fs.readFile(SNAPSHOT, 'utf-8'))
const byId = new Map()
for (const entry of Object.values(snapshot)) {
  for (const t of entry.teams ?? []) {
    if (t.name && !byId.has(t.id)) byId.set(t.id, { id: t.id, abbr: t.abbr, name: t.name })
  }
}

const teams = []
for (const t of byId.values()) {
  try {
    await fs.access(join(LOGOS_DIR, `${t.id}.svg`))
    teams.push(t)
  } catch {
    process.stdout.write(`  (skipping defunct franchise: ${t.name})\n`)
  }
}
teams.sort((a, b) => a.name.localeCompare(b.name))

await fs.mkdir(OUT_DIR, { recursive: true })
let created = 0
let skipped = 0
const failed = []

for (const team of teams) {
  const slug = slugify(team.name)
  const file = join(OUT_DIR, `${slug}.md`)

  if (!FORCE) {
    try {
      await fs.access(file)
      skipped++
      continue
    } catch {
      // not generated yet
    }
  }

  try {
    const intro = await fetchIntro(team.name)
    const body = intro
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, MAX_PARAGRAPHS)
      .join('\n\n')

    const md = [
      '---',
      `name: ${yaml(team.name)}`,
      `slug: ${slug}`,
      `nbaId: ${team.id}`,
      `abbr: ${yaml(team.abbr)}`,
      `logo: ${yaml(`/logos/${team.id}.svg`)}`,
      '---',
      '',
      body,
      '',
    ].join('\n')

    await fs.writeFile(file, md, 'utf-8')
    created++
    process.stdout.write(`  ✓ ${slug}\n`)
  } catch (err) {
    failed.push(`${team.name} (${err.message})`)
    process.stdout.write(`  ✗ ${team.name} — ${err.message}\n`)
  }

  await sleep(700)
}

console.log('\n--- summary ---')
console.log(`created: ${created}, skipped: ${skipped}, failed: ${failed.length}`)
for (const f of failed) console.log(`   - ${f}`)
