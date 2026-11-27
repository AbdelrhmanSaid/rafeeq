// Builds the Madinah Mushaf layout the Quran reader draws: one JSON file per page in public/data/mushaf, and a small
// index of where each page and surah starts in src/features/quran/data/mushaf-index.js.
//
// The layout comes from the Quran.com API (King Fahd Complex 15-line Mushaf, QCF V2 glyphs), so each word is drawn
// with its page's own font exactly where the printed Mushaf puts it.
//
//   node scripts/build-mushaf-data.js [raw-dir]
//
// raw-dir caches the API responses (default: node_modules/.cache/mushaf-raw), so a rebuild doesn't refetch them.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rawDir = path.resolve(process.argv[2] || path.join(root, 'node_modules/.cache/mushaf-raw'))
const outDir = path.join(root, 'public/data/mushaf')
const indexFile = path.join(root, 'src/features/quran/data/mushaf-index.js')

const PAGES = 604
const LINES = 15
const API = 'https://api.quran.com/api/v4/verses/by_page'
const QUERY =
  'words=true&word_fields=code_v2,line_number,page_number&fields=text_uthmani,chapter_id&per_page=all&mushaf=1'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchPage(page) {
  const file = path.join(rawDir, `${page}.json`)
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))

  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${API}/${page}?${QUERY}`)
    if (response.ok) {
      const data = await response.json()
      fs.writeFileSync(file, JSON.stringify(data))
      return data
    }
    if (attempt === 4) throw new Error(`Page ${page}: HTTP ${response.status}`)
    await sleep(1000 * attempt)
  }
}

async function fetchAll() {
  fs.mkdirSync(rawDir, { recursive: true })
  const pages = new Array(PAGES)
  let next = 1
  const worker = async () => {
    while (next <= PAGES) {
      const page = next++
      pages[page - 1] = await fetchPage(page)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  return pages
}

// Pages 1 and 2 open the Mushaf on eight centred lines. Elsewhere a line is centred when its words fall well short of
// the page width, mostly where a surah ends on the last pages. These were found by measuring every line with its page
// font: the lines listed come out under 90% of a full line, against 95% or more for every justified one.
const CENTERED_LINES = {
  255: [2],
  528: [9],
  534: [6],
  545: [6],
  586: [1],
  593: [2],
  594: [5],
  600: [10],
  602: [5, 11, 15],
  603: [10, 15],
  604: [4, 9, 14, 15],
}
const isCentered = (page, line) => page <= 2 || (CENTERED_LINES[page] || []).includes(line)

// The API puts the first word of the next line at the end of these lines, which then run about 12% past the page
// while the next falls short; moving that word down brings both to a full line.
const LINES_WITH_A_WORD_TOO_MANY = { 27: 14, 177: 11, 400: 5, 443: 12, 589: 13 }

function moveLastWordDown(lines, line) {
  const from = lines.get(line)
  const to = lines.get(line + 1)
  const last = from.at(-1)
  const words = last[1].split(' ')
  const word = words.pop()

  if (words.length) last[1] = words.join(' ')
  else from.pop()

  if (to[0][0] === last[0]) to[0][1] = `${word} ${to[0][1]}`
  else to.unshift([last[0], word])
}

// A few ayat come back with the page next to their own (5:77 with page 121, say), but every word carries its true page
// and line, so the words are sorted by those.
function buildPages(responses) {
  const verses = new Map()
  for (const response of responses) for (const verse of response.verses) verses.set(verse.verse_key, verse)

  const pages = Array.from({ length: PAGES }, (_, i) => ({ page: i + 1, lines: new Map(), verses: new Map() }))
  const order = [...verses.values()].sort((a, b) => a.id - b.id)

  for (const verse of order) {
    for (const word of verse.words) {
      const page = pages[word.page_number - 1]
      if (!page.verses.has(verse.verse_key)) page.verses.set(verse.verse_key, verse)

      const segments = page.lines.get(word.line_number) || []
      const last = segments.at(-1)
      if (last && last[0] === verse.verse_key) last[1] += ` ${word.code_v2}`
      else segments.push([verse.verse_key, word.code_v2])
      page.lines.set(word.line_number, segments)
    }
  }

  for (const [page, line] of Object.entries(LINES_WITH_A_WORD_TOO_MANY)) moveLastWordDown(pages[page - 1].lines, line)

  return pages.map(({ page, lines, verses: pageVerses }) => {
    const first = pageVerses.values().next().value
    const layout = []
    for (let line = 1; line <= (page <= 2 ? 8 : LINES); line++) {
      const segments = lines.get(line)
      layout.push(segments ? { segments, ...(isCentered(page, line) && { centered: true }) } : null)
    }

    return {
      page,
      juz: first.juz_number,
      hizb: first.hizb_number,
      lines: layout,
      verses: Object.fromEntries([...pageVerses].map(([key, verse]) => [key, verse.text_uthmani])),
    }
  })
}

// The empty lines are the surah titles and Basmalas the API leaves out. Walking back from each surah's first ayah: the
// line just above it is its Basmala (except Al-Fatihah, whose Basmala is its first ayah, and At-Tawbah, which has none),
// and the line above that is its title. A title can end one page while its Basmala starts the next.
function fillHeadings(pages) {
  const slots = pages.flatMap((p) => p.lines.map((line, index) => ({ page: p, index, line })))

  const fill = (slot, value) => (slot.page.lines[slot.index] = value)

  slots.forEach((slot, i) => {
    const first = slot.line?.segments[0]
    if (!first || !first[0].endsWith(':1')) return
    // Only the line where the ayah starts; an ayah 1 continuing from the line above has no heading.
    if (slots[i - 1]?.line?.segments?.at(-1)[0] === first[0]) return

    const surah = Number(first[0].split(':')[0])
    let above = i - 1
    if (surah !== 1 && surah !== 9) fill(slots[above--], { basmala: true })
    fill(slots[above], { surah })
  })

  const empty = slots.filter((s) => s.page.lines[s.index] === null)
  if (empty.length) throw new Error(`Unfilled lines: ${empty.map((s) => `${s.page.page}:${s.index + 1}`).join(', ')}`)
}

const pages = buildPages(await fetchAll())
fillHeadings(pages)

fs.mkdirSync(outDir, { recursive: true })
for (const page of pages) fs.writeFileSync(path.join(outDir, `${page.page}.json`), JSON.stringify(page))

// The surah and juz each page starts in, and how many ayat start on each page, which is enough to find any ayah's page.
const pageStarts = pages.map((p) => [Number(Object.keys(p.verses)[0].split(':')[0]), p.juz])
const ayahsStarting = pages.map((p, i) => {
  const previous = i ? Object.keys(pages[i - 1].verses) : []
  return Object.keys(p.verses).filter((key) => !previous.includes(key)).length
})
const ayahCount = ayahsStarting.reduce((sum, n) => sum + n, 0)
if (ayahCount !== 6236) throw new Error(`Counted ${ayahCount} ayat`)

fs.writeFileSync(
  indexFile,
  `// Generated by scripts/build-mushaf-data.js.

// The surah and juz each page of the Madinah Mushaf starts in, page 1 first.
export const PAGE_STARTS = ${JSON.stringify(pageStarts)}

// How many ayat start on each page, page 1 first.
export const AYAHS_STARTING = ${JSON.stringify(ayahsStarting)}
`,
)

const size = pages.reduce((sum, p) => sum + JSON.stringify(p).length, 0)
console.log(`Wrote ${pages.length} pages (${(size / 1024).toFixed(0)} KB) and the index.`)
