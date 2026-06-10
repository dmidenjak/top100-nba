# TOP 100 — NBA Players

A static site ranking the 100 greatest NBA players, each with a short bio, a
portrait, profile facts, and season stats. Built with **Nuxt 3** (Vue 3),
**@nuxt/content**, **@nuxt/image**, and **Tailwind CSS**.

## Architecture: "git is the database"

There is **no database and no runtime API**. The site is fully static. All data
lives as files committed to the repo, assembled at build time into static HTML:

```
content/players/*.md   ← bios + card fields   (hand-authored — human-owned)
data/stats.json        ← NBA stats snapshot    (generated — script-owned)
public/images/*.jpg     ← downloaded portraits  (generated — script-owned)
        │
        ▼  nuxt generate  (merges all three; @nuxt/image bakes optimized WebP variants)
        ▼
   .output/public/   →  deploy to any static host / CDN
```

This is the right pattern for bounded, read-only, rarely-changing content: it's
fast, free to host, has no server to attack, and no external API is ever hit at
build or runtime.

## Scripts

```bash
npm install
npm run dev            # http://localhost:3000

npm run players        # (re)generate bios from Wikipedia for the seed list
npm run images         # download remote portraits into public/images + relink
npm run sync           # fetch NBA stats into data/stats.json (needs Python)
npm run rank           # stamp ranks into the .md files from players-data order

npm run generate       # build the static site → .output/public
npm run preview        # preview the generated site locally
```

- **Seed list:** `scripts/players-data.mjs` — the ranked 100 names. Edit here.
- All generator scripts are **resumable** and **skip existing work**, so they're
  safe to re-run and never clobber hand-edited bios.

### Getting stats (`npm run sync`)

Stats come from [`nba_api`](https://github.com/swar/nba_api), which wraps the
NBA's official stats.nba.com endpoints — **free, no API key, covers every era**
(including pre-1979 legends).

```bash
pip install -r scripts/requirements.txt
npm run sync                         # = python scripts/sync_stats.py
python scripts/sync_stats.py --force # re-fetch everyone
python scripts/sync_stats.py --limit 5   # test on the first 5
```

Notes:
- Player IDs are resolved from nba_api's bundled offline list (no rate limit).
- stats.nba.com is unofficial and can rate-limit/block; the script saves after
  every player, so if it stops, just run it again to resume.
- Hand-authored frontmatter `seasonStats` (see `content/players/larry-bird.md`)
  always takes precedence over the synced snapshot.
- If a name doesn't resolve, add `slug -> id` to the `OVERRIDES` dict in
  `scripts/sync_stats.py`.

## Reordering the ranking

The order of the list in `scripts/players-data.mjs` **is** the ranking (top =
#1). To reorder: move lines up/down in that file, then run `npm run rank` — it
rewrites the `rank:` field in each `content/players/*.md`. The homepage sorts by
that field, so the new order shows up immediately.

To override a single rank by hand instead, just edit the `rank:` number in that
player's `.md` (but then keep `players-data.mjs` in sync, or the next
`npm run rank` will revert it).

## Adding a player

Add a `{ rank, name }` entry to `scripts/players-data.mjs`, then run
`npm run players && npm run images` (and `npm run sync` if you want stats). A new
`/players/<slug>` route appears automatically.

## Deploying

`npm run generate` outputs static files (including pre-optimized WebP images) to
`.output/public`. Deploy that folder to Vercel, Netlify, Cloudflare Pages, or any
static host — no server required.
