import { foldWord, skeleton } from '@/features/quran/lib/fold'
import spellings from '@/features/quran/data/search-spellings.js'

const MIN_LETTERS = 3
const WORDS_BEFORE = 3
const WORDS_SHOWN = 18

const wordKey = (word) => spellings[word] ?? foldWord(word)

// No spaces, as يا أيها is typed ياأيها too, and alefs that meet are read as one (يَـٰٓأَيُّهَا).
const append = (text, key) => text + (text.endsWith('ا') && key.startsWith('ا') ? key.slice(1) : key)

const skeletons = (keys) => keys.map(skeleton).filter(Boolean)

export async function buildIndex(verses, pause = () => new Promise((resolve) => setTimeout(resolve))) {
  // Collected in pieces: asking a string this long how it ends, 82,000 times, is what would make this slow.
  const pieces = []
  let last = ''
  let length = 0
  const ends = new Uint32Array(verses.length)
  const close = []
  const folded = new Map()
  const fold = (word) => folded.get(word) ?? folded.set(word, wordKey(word)).get(word)
  for (const [position, verse] of verses.entries()) {
    if (position && position % 400 === 0) await pause()
    const keys = verse.split(' ').map(fold)
    for (const key of keys) {
      const piece = append(last, key).slice(last.length)
      if (!piece) continue
      pieces.push(piece)
      length += piece.length
      last = piece.at(-1)
    }
    ends[position] = length
    close.push(` ${skeletons(keys).join(' ')} `)
  }
  return { verses, text: pieces.join(''), ends, close }
}

export function parseQuery(text) {
  const keys = String(text ?? '')
    .trim()
    .split(/\s+/)
    .map(wordKey)
    .filter(Boolean)
  const exact = keys.reduce(append, '')
  const close = skeletons(keys)
  return {
    exact: exact.length >= MIN_LETTERS ? exact : '',
    close: close.join('').length >= MIN_LETTERS ? close : [],
    isPhrase: keys.length > 1,
  }
}

export const isSearchable = (query) => Boolean(query.exact || query.close.length)

const startOf = (index, position) => (position ? index.ends[position - 1] : 0)

function ayahAt(index, offset) {
  let low = 0
  let high = index.ends.length - 1
  while (low < high) {
    const middle = (low + high) >> 1
    if (index.ends[middle] > offset) high = middle
    else low = middle + 1
  }
  return low
}

function* occurrences(index, query, from = 0, to = index.text.length) {
  const { length } = query.exact
  for (
    let at = index.text.indexOf(query.exact, from);
    at !== -1 && at < to;
    at = index.text.indexOf(query.exact, at + 1)
  ) {
    const first = ayahAt(index, at)
    const last = ayahAt(index, at + length - 1)
    if (first === last || query.isPhrase) yield [at, at + length, first, last]
  }
}

export function searchAyat(index, query) {
  const exact = new Set()
  if (query.exact) {
    for (const [, , first, last] of occurrences(index, query)) {
      for (let position = first; position <= last; position++) exact.add(position)
    }
  }

  const words = query.close.join(' ')
  const close = []
  if (words) {
    index.close.forEach((key, position) => {
      if (!exact.has(position) && key.includes(words)) close.push(position)
    })
  }
  return { exact: [...exact], close }
}

function matchedWords(index, position, keys, query, isClose) {
  const hits = keys.map(() => false)

  if (isClose) {
    const spelled = keys.map((key, word) => ({ skeleton: skeleton(key), word })).filter((entry) => entry.skeleton)
    const last = query.close.length - 1
    const fits = (word, typed, offset) => {
      if (last === 0) return word.includes(typed)
      if (offset === 0) return word.endsWith(typed)
      return offset === last ? word.startsWith(typed) : word === typed
    }
    for (let from = 0; from + last < spelled.length; from++) {
      const matches = query.close.every((typed, offset) => fits(spelled[from + offset].skeleton, typed, offset))
      if (matches) hits.fill(true, spelled[from].word, spelled[from + last].word + 1)
    }
    return hits
  }

  const start = startOf(index, position)
  let read = index.text.slice(Math.max(0, start - 1), start)
  const ends = keys.map((key) => (read = append(read, key)).length + start - (start ? 1 : 0))
  for (const [from, to] of occurrences(
    index,
    query,
    Math.max(0, start - query.exact.length + 1),
    index.ends[position],
  )) {
    ends.forEach((end, word) => {
      const wordStart = ends[word - 1] ?? start
      if (wordStart < to && end > from) hits[word] = true
    })
  }
  return hits
}

export function excerpt(index, position, query, isClose = false) {
  const words = index.verses[position].split(' ')
  const hits = matchedWords(index, position, words.map(wordKey), query, isClose)

  let start = Math.max(0, hits.indexOf(true) - WORDS_BEFORE)
  let end = Math.min(words.length, start + WORDS_SHOWN)
  start = Math.max(0, Math.min(start, end - WORDS_SHOWN))
  if (start <= 2) start = 0
  if (words.length - end <= 2) end = words.length

  const segments = []
  for (let word = start; word < end; word++) {
    const segment = segments.at(-1)
    if (segment?.hit === hits[word]) segment.text += ` ${words[word]}`
    else if (hits[word]) {
      if (segment) segment.text += ' '
      segments.push({ text: words[word], hit: true })
    } else segments.push({ text: segment ? ` ${words[word]}` : words[word], hit: false })
  }
  return { segments, clippedStart: start > 0, clippedEnd: end < words.length }
}
