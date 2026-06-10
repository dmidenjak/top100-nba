// Stamps hand-curated nicknames into the `nickname:` frontmatter field of
// content/players/*.md. Nicknames are folklore — no API has them — so this
// map is the source of truth. Players not listed keep an empty field (not
// every legend has an iconic nickname; we don't force one).
//
//   node scripts/set-nicknames.mjs
//
// Only touches the nickname line, and never overwrites a non-empty one.
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content', 'players')

const nicknames = {
  'michael-jordan': 'His Airness',
  'lebron-james': 'The King',
  'kareem-abdul-jabbar': 'Cap',
  'wilt-chamberlain': 'The Big Dipper',
  'tim-duncan': 'The Big Fundamental',
  'kobe-bryant': 'Black Mamba',
  'shaquille-oneal': 'The Diesel',
  'hakeem-olajuwon': 'The Dream',
  'oscar-robertson': 'The Big O',
  'jerry-west': 'The Logo',
  'kevin-durant': 'The Slim Reaper',
  'stephen-curry': 'Chef Curry',
  'moses-malone': 'Chairman of the Boards',
  'julius-erving': 'Dr. J',
  'karl-malone': 'The Mailman',
  'charles-barkley': 'Sir Charles',
  'david-robinson': 'The Admiral',
  'kevin-garnett': 'The Big Ticket',
  'dirk-nowitzki': 'The Big German',
  'scottie-pippen': 'Pip',
  'giannis-antetokounmpo': 'The Greek Freak',
  'isiah-thomas': 'Zeke',
  'dwyane-wade': 'Flash',
  'allen-iverson': 'The Answer',
  'gary-payton': 'The Glove',
  'chris-paul': 'CP3',
  'john-havlicek': 'Hondo',
  'george-mikan': 'Mr. Basketball',
  'clyde-drexler': 'Clyde the Glide',
  'james-harden': 'The Beard',
  'nikola-jokic': 'The Joker',
  'pete-maravich': 'Pistol Pete',
  'walt-frazier': 'Clyde',
  'willis-reed': 'The Captain',
  'dave-cowens': 'Big Red',
  'bob-cousy': 'The Houdini of the Hardwood',
  'dominique-wilkins': 'The Human Highlight Film',
  'reggie-miller': 'Miller Time',
  'ray-allen': 'Jesus Shuttlesworth',
  'paul-pierce': 'The Truth',
  'kawhi-leonard': 'The Klaw',
  'russell-westbrook': 'Brodie',
  'anthony-davis': 'The Brow',
  'damian-lillard': 'Dame Time',
  'carmelo-anthony': 'Melo',
  'tracy-mcgrady': 'T-Mac',
  'vince-carter': 'Vinsanity',
  'chris-webber': 'C-Webb',
  'alonzo-mourning': 'Zo',
  'dikembe-mutombo': 'Mount Mutombo',
  'robert-parish': 'The Chief',
  'kevin-mchale': 'The Black Hole',
  'james-worthy': 'Big Game James',
  'dennis-rodman': 'The Worm',
  'connie-hawkins': 'The Hawk',
  'elvin-hayes': 'The Big E',
  'nate-thurmond': 'Nate the Great',
  'earl-monroe': 'Earl the Pearl',
  'paul-arizin': "Pitchin' Paul",
  'nate-archibald': 'Tiny',
  'joe-dumars': 'Joe D',
  'ben-wallace': 'Big Ben',
  'chauncey-billups': 'Mr. Big Shot',
  'bill-walton': 'The Big Redhead',
  'adrian-dantley': 'The Teacher',
  'yao-ming': 'The Great Wall',
  'klay-thompson': 'Game 6 Klay',
  'kyrie-irving': 'Uncle Drew',
  'joel-embiid': 'The Process',
  'luka-doncic': 'Luka Magic',
  'paul-george': 'PG-13',
  'jimmy-butler': 'Jimmy Buckets',
}

let updated = 0
let skippedExisting = 0

for (const [slug, nickname] of Object.entries(nicknames)) {
  const file = join(CONTENT_DIR, `${slug}.md`)
  let md
  try {
    md = await fs.readFile(file, 'utf-8')
  } catch {
    console.log(`  ✗ ${slug}.md not found`)
    continue
  }

  // Never overwrite a hand-edited nickname. ([ \t]* not \s* — \s would match
  // the newline and "see" the next frontmatter line as a value.)
  if (/^nickname:[ \t]*\S/m.test(md)) {
    skippedExisting++
    continue
  }

  const next = md.replace(/^nickname:\s*$/m, `nickname: ${JSON.stringify(nickname)}`)
  if (next !== md) {
    await fs.writeFile(file, next, 'utf-8')
    updated++
  } else {
    console.log(`  ⚠ no empty nickname line in ${slug}.md`)
  }
}

console.log(`✓ nicknames written: ${updated}, already set (untouched): ${skippedExisting}`)
