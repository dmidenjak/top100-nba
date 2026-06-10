// Downloads each player's portrait (currently a remote Wikimedia URL in the
// Markdown frontmatter) into public/images/<slug>.<ext>, then rewrites the
// frontmatter `image:` field to the local path.
//
//   node scripts/download-images.mjs
//
// Safe to re-run: players whose `image:` already points at /images/ are skipped.
import { promises as fs } from 'node:fs'
import { dirname, join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content', 'players')
const IMAGES_DIR = join(__dirname, '..', 'public', 'images')
const UA = 'top100-nba (learning project)'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Fetch with retry + exponential backoff on HTTP 429 (rate limit).
async function fetchWithRetry(url, attempt = 0) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (res.status === 429 && attempt < 5) {
    const retryAfter = Number(res.headers.get('retry-after')) || 0
    const wait = Math.max(retryAfter * 1000, 2000 * 2 ** attempt)
    process.stdout.write(`    …rate limited, waiting ${wait / 1000}s\n`)
    await sleep(wait)
    return fetchWithRetry(url, attempt + 1)
  }
  return res
}

await fs.mkdir(IMAGES_DIR, { recursive: true })
const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'))

let downloaded = 0
let skipped = 0
const failed = []

for (const file of files) {
  const slug = basename(file, '.md')
  const path = join(CONTENT_DIR, file)
  const md = await fs.readFile(path, 'utf-8')

  // Pull the image URL out of the frontmatter.
  const match = md.match(/^image:\s*"?([^"\n]+)"?\s*$/m)
  const url = match?.[1]?.trim()

  if (!url || url.startsWith('/images/')) {
    skipped++
    continue
  }

  try {
    // Derive a sane file extension from the URL path (Wikimedia ends in .jpg/.png).
    let ext = extname(new URL(url).pathname).toLowerCase()
    if (!/^\.(jpe?g|png|gif|webp)$/.test(ext)) ext = '.jpg'

    const res = await fetchWithRetry(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(join(IMAGES_DIR, `${slug}${ext}`), buf)

    // Rewrite the frontmatter to the local path (regex replace keeps the rest
    // of the file byte-for-byte identical).
    const localPath = `/images/${slug}${ext}`
    const updated = md.replace(/^image:.*$/m, `image: "${localPath}"`)
    await fs.writeFile(path, updated, 'utf-8')

    downloaded++
    process.stdout.write(`  ✓ ${slug}${ext}\n`)
  } catch (err) {
    failed.push(`${slug} (${err.message})`)
    process.stdout.write(`  ✗ ${slug} — ${err.message}\n`)
  }

  await sleep(700)
}

console.log('\n--- summary ---')
console.log(`downloaded: ${downloaded}`)
console.log(`skipped (already local or no image): ${skipped}`)
if (failed.length) {
  console.log(`failed: ${failed.length}`)
  for (const f of failed) console.log(`   - ${f}`)
}
