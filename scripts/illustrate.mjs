// EXPERIMENT: AI-illustrated player portraits via the Gemini image model.
// Takes our local photos and asks the model to restyle them as painted
// trading-card illustrations while preserving the player's likeness.
//
//   node --env-file=.env scripts/illustrate.mjs [slug ...]
//
// Defaults to the 3 test players. Outputs to public/images/illustrated/.
// Requires GEMINI_API_KEY in .env (gitignored — never reaches the repo).
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES = join(__dirname, '..', 'public', 'images')
const OUT = join(IMAGES, 'illustrated')

const KEY = process.env.GEMINI_API_KEY
if (!KEY) {
  console.error('✗ GEMINI_API_KEY missing — put it in .env')
  process.exit(1)
}

const MODEL = 'gemini-2.5-flash-image'
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// One identical prompt for every player — consistency is the whole experiment.
const STYLE_PROMPT =
  'Transform this photograph into a vintage basketball trading-card illustration: ' +
  'a painted portrait with bold visible brush strokes, subtle halftone texture, ' +
  'a warm palette of deep orange, cream and dark charcoal, dramatic rim lighting, ' +
  'dark moody background. Critical: preserve the person\'s facial features and ' +
  'likeness exactly — they must remain instantly recognizable. Keep the framing ' +
  'of the original photo.'

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['bill-russell', 'michael-jordan', 'stephen-curry']

await fs.mkdir(OUT, { recursive: true })

for (const slug of slugs) {
  try {
    const source = await fs.readFile(join(IMAGES, `${slug}.jpg`))

    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: source.toString('base64') } },
              { text: STYLE_PROMPT },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HTTP ${res.status}: ${err.slice(0, 300)}`)
    }

    const data = await res.json()
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data)
    const img = part?.inlineData?.data ?? part?.inline_data?.data
    if (!img) {
      const text = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text
      throw new Error(`no image in response${text ? ` (model said: ${text.slice(0, 200)})` : ''}`)
    }

    await fs.writeFile(join(OUT, `${slug}.png`), Buffer.from(img, 'base64'))
    console.log(`  ✓ ${slug}.png`)
  } catch (err) {
    console.log(`  ✗ ${slug} — ${err.message}`)
  }
}
