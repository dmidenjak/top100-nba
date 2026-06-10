// One color identity per award, used in two places: the accolade tile's hover
// border, and the stats-table rows highlighted while that tile is hovered.
// Gold/amber stays reserved for championships; every other award gets its own hue.
//
// NOTE: these must be literal Tailwind class strings (the build scans source
// for class names) — never assemble them dynamically.
export const awardColors: Record<string, { tile: string; row: string }> = {
  championships: { tile: 'hover:border-amber-300/70', row: 'bg-amber-400/25' },
  mvp: { tile: 'hover:border-violet-300/70', row: 'bg-violet-400/25' },
  finalsMvp: { tile: 'hover:border-rose-300/70', row: 'bg-rose-400/25' },
  dpoy: { tile: 'hover:border-emerald-300/70', row: 'bg-emerald-400/25' },
  allStar: { tile: 'hover:border-sky-300/70', row: 'bg-sky-400/25' },
  allNbaFirst: { tile: 'hover:border-blue-300/70', row: 'bg-blue-400/25' },
  allNbaSecond: { tile: 'hover:border-indigo-300/70', row: 'bg-indigo-400/25' },
  allNbaThird: { tile: 'hover:border-teal-300/70', row: 'bg-teal-400/25' },
}
