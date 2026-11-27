// The mushaf is written in the Uthmani rasm and people type in today's spelling, so both are folded to the same letters.

const FATHA = '\u064e'
const DAMMA = '\u064f'
const KASRA = '\u0650'
const SHADDA = '\u0651'
const HAMZA_ABOVE = '\u0654'
const DAGGER_ALEF = '\u0670'
const SMALL_WAW = '\u06e5'
const SMALL_YA = '\u06e6'
const SMALL_HIGH_YA = '\u06e7'
const SMALL_HIGH_NOON = '\u06e8'
const TATWEEL = 'ـ'
const WASLA = 'ٱ'

const isLetter = (char) => (char >= '\u0621' && char <= '\u063a') || (char >= '\u0641' && char <= '\u064a')
const isMark = (char) =>
  (char >= '\u064b' && char <= '\u0655') || char === DAGGER_ALEF || (char >= '\u06d6' && char <= '\u06ed')

function clusters(word) {
  const list = []
  for (const char of word) {
    if (isLetter(char) || char === WASLA || char === TATWEEL) list.push({ base: char, marks: '' })
    else if (isMark(char) && list.length) list.at(-1).marks += char
  }
  return list
}

const PLAIN = { أ: 'ا', إ: 'ا', آ: 'ا', [WASLA]: 'ا', ؤ: 'و', ئ: 'ي', ة: 'ه', ى: 'ي', [TATWEEL]: '' }

const has = (cluster, mark) => cluster.marks.includes(mark)
const isSeatlessHamza = (cluster) => cluster.base === 'ء' || (cluster.base === TATWEEL && has(cluster, HAMZA_ABOVE))
const isLongAlef = (cluster) => cluster.base === 'ا' || cluster.base === 'آ' || has(cluster, DAGGER_ALEF)

function seat(list, index) {
  const hamza = list[index]
  const before = list[index - 1]
  const after = list[index + 1]

  if (!before) return 'ا'
  if (!after) return 'ء'
  if (index === 1 && before.base === 'أ') return 'ا'
  if (before.base === 'ي' || before.base === 'ى') return 'ي'
  if (after.base === 'ا' || has(hamza, DAGGER_ALEF)) return ''
  if (has(hamza, KASRA) || has(before, KASRA)) return 'ي'
  if (isLongAlef(before) || before.base === 'و') return has(hamza, DAMMA) && after.base !== 'و' ? 'و' : 'ء'
  if (has(hamza, DAMMA)) return after.base !== 'و' ? 'و' : hamza.base === TATWEEL ? 'ي' : 'ء'
  if (has(hamza, FATHA)) return 'ا'
  return has(before, DAMMA) ? 'و' : 'ا'
}

function read(list, index) {
  const cluster = list[index]
  const { base } = cluster
  const last = index === list.length - 1
  let letter = PLAIN[base] ?? base

  if (isSeatlessHamza(cluster)) letter = seat(list, index)
  // ٱلَّيْل is الليل, but ٱلَّذِى and ٱلَّتِى keep their one lam.
  else if (base === 'ل' && has(cluster, SHADDA) && list[index - 1]?.base === WASLA) {
    if (!'ذت'.includes(list[index + 1]?.base)) letter = 'لل'
  }
  // ٱلصَّلَوٰة and ٱلتَّوْرَىٰة: the waw or ya only carries the alef that is read.
  else if (base === 'و' && has(cluster, DAGGER_ALEF) && !/[\u064e-\u0651]/.test(cluster.marks)) letter = ''
  else if (base === 'ى' && has(cluster, DAGGER_ALEF)) return last ? 'ي' : 'ا'

  if (has(cluster, DAGGER_ALEF)) letter += 'ا'
  if (has(cluster, SMALL_HIGH_YA)) letter += 'ي'
  if (has(cluster, SMALL_HIGH_NOON)) letter += 'ن'
  if (has(cluster, SMALL_WAW) && base === 'و') letter += 'و'
  if (has(cluster, SMALL_YA) && (base === 'ي' || base === 'ى')) letter += 'ي'
  return letter
}

const CONVENTIONS = [
  [/هاذ(?=ا|ه|ان|ين)/g, 'هذ'],
  [/ذال(?=ك)/g, 'ذل'],
  [/لاكن/g, 'لكن'],
  [/رحمان/g, 'رحمن'],
  [/اولا[يء]ك/g, 'اوليك'],
  [/هاولا/g, 'هولا'],
  [/الاه/g, 'اله'],
  [/سماوات|سموات/g, 'سموت'],
  [/داوود/g, 'داود'],
]

export function foldWord(word) {
  const list = clusters(word)
  const key = list.map((_, index) => read(list, index)).join('')
  return CONVENTIONS.reduce(
    (text, [pattern, spelling]) => text.replace(pattern, spelling),
    key.replace(/وا$/, 'و').replace(/ا+/g, 'ا'),
  )
}

const SOUND_ALIKE = { ظ: 'ض', ذ: 'ز', ث: 'س', ص: 'س', ط: 'ت' }

export const skeleton = (key) => key.replace(/[اويء]/g, '').replace(/[ظذثصط]/g, (letter) => SOUND_ALIKE[letter])
