import { beforeAll, describe, expect, it } from 'vitest'
import { buildIndex, excerpt, isSearchable, parseQuery, searchAyat } from './ayahSearch'
import { ayahIndex, verseAt, verseKey } from './mushaf'
import { readVerses } from './quranText.testing'

let verses
let index

beforeAll(async () => {
  verses = readVerses()
  index = await buildIndex(verses, () => {})
})

const keys = (positions) =>
  positions.map((position) => {
    const { surah, ayah } = verseAt(position + 1)
    return verseKey(surah, ayah)
  })
const find = (text) => {
  const found = searchAyat(index, parseQuery(text))
  return { exact: keys(found.exact), close: keys(found.close) }
}
const textOf = (surah, ayah) => verses[ayahIndex(surah, ayah) - 1]
const bare = (text) => text.replace(/[\u064b-\u0655\u0670\u0640\u06d6-\u06ed]/g, '').replace(/ +/g, ' ')
const shown = (surah, ayah, query, isClose) => excerpt(index, ayahIndex(surah, ayah) - 1, parseQuery(query), isClose)
const marked = (surah, ayah, query, isClose) =>
  shown(surah, ayah, query, isClose)
    .segments.filter((segment) => segment.hit)
    .map((segment) => bare(segment.text))

describe('searchAyat', () => {
  it('finds the Mushaf’s spelling from the way a phrase is typed today', () => {
    expect(find('الحمد لله رب العالمين').exact).toEqual(['1:2', '6:45', '10:10', '37:182', '39:75', '40:65'])
    expect(find('مالك يوم الدين').exact).toEqual(['1:4'])
    expect(find('الله لا إله إلا هو الحي القيوم').exact).toEqual(['2:255', '3:2'])
    expect(find('ذلك الكتاب لا ريب فيه').exact).toEqual(['2:2'])
    expect(find('والليل إذا يغشى').exact).toEqual(['92:1'])
    expect(find('يسألونك عن الأهلة').exact).toEqual(['2:189'])
  })

  it('ignores tashkeel, hamzas, spaces and the letters left off word ends', () => {
    const standard = find('يا أيها الذين آمنوا').exact

    expect(standard).toHaveLength(89)
    expect(find('ياايها الذين امنو').exact).toEqual(standard)
    expect(find('يَا أَيُّهَا الَّذِينَ آمَنُوا').exact).toEqual(standard)
    expect(find('واقيمو الصلاه').exact).toEqual(find('وأقيموا الصلاة').exact)
    expect(find('الرحمان الرحيم').exact).toEqual(find('الرحمن الرحيم').exact)
    expect(find('الذين يومنون بالغيب').exact).toEqual(['2:3'])
  })

  it('finds an ayah pasted as the Mushaf writes it', () => {
    expect(find(textOf(112, 1)).exact).toEqual(['112:1'])
    expect(find(textOf(2, 189).split(' ').slice(0, 4).join(' ')).exact).toEqual(['2:189'])
  })

  it('lists ayat in Mushaf order, the close ones apart from the exact', () => {
    const { exact, close } = find('الله')

    expect(exact[0]).toBe('1:1')
    expect(exact).toEqual(
      [...exact].sort((a, b) => ayahIndex(...a.split(':').map(Number)) - ayahIndex(...b.split(':').map(Number))),
    )
    expect(close.some((key) => exact.includes(key))).toBe(false)
  })

  it('falls back to the words’ skeletons for a misspelled phrase', () => {
    expect(find('ان مع العصر يسرا')).toEqual({ exact: [], close: ['94:5', '94:6'] })
    expect(find('انا اعتيناك الكوثر')).toEqual({ exact: [], close: ['108:1'] })
    expect(find('الصرات المستقيم')).toEqual({ exact: [], close: ['1:6', '37:118'] })
    expect(find('لايلف قريش')).toEqual({ exact: [], close: ['106:1'] })
  })

  it('matches close words whole, but for a prefix on the first and a last one still being typed', () => {
    expect(find('ان مع العص').close).toEqual(['94:5', '94:6'])
    expect(find('مع العصر يس').close).toEqual(['94:5', '94:6'])
    expect(find('ع العصر يسرا').close).toEqual(['94:5', '94:6'])
    expect(find('مع العص يسرا').close).toEqual([])
  })

  it('finds a passage that runs from one ayah into the next', () => {
    expect(find('الرحمن علم القرآن').exact).toEqual(['55:1', '55:2'])
    expect(find('قل هو الله أحد الله الصمد لم يلد').exact).toEqual(['112:1', '112:2', '112:3'])
    expect(find('فإن مع العسر يسرا إن مع العسر يسرا').exact).toEqual(['94:5', '94:6'])
    expect(find('العالمين الرحمن الرحيم مالك').exact).toEqual(['1:2', '1:3', '1:4'])
  })

  it('keeps a single word inside an ayah', () => {
    expect(find('مين الرح').exact).toEqual(['1:2', '1:3'])
    expect(find('مينالرح').exact).toEqual([])
  })

  it('leaves alone a query too short to mean anything', () => {
    expect(isSearchable(parseQuery('قل'))).toBe(false)
    expect(isSearchable(parseQuery('  '))).toBe(false)
    expect(isSearchable(parseQuery('quran'))).toBe(false)
    expect(isSearchable(parseQuery('نور'))).toBe(true)
  })
})

describe('excerpt', () => {
  it('marks the whole words a match lands on', () => {
    expect(marked(1, 2, 'لله رب')).toEqual(['لله رب'])
    expect(marked(1, 2, 'حمد لله ر')).toEqual(['ٱلحمد لله رب'])
    expect(marked(94, 5, 'مع العصر', true)).toEqual(['مع ٱلعسر'])
  })

  it('marks every place the phrase comes in the ayah, and the pause marks inside it', () => {
    expect(marked(55, 13, 'فبأي آلاء')).toEqual(['فبأى ءالاء'])
    expect(marked(2, 2, 'لا ريب فيه هدى')).toEqual(['لا ريب فيه هدى'])
    expect(marked(109, 3, 'ما اعبد')).toHaveLength(1)
    expect(marked(2, 255, 'الله')).toHaveLength(1)
    expect(marked(3, 26, 'من تشاء')).toHaveLength(4)
  })

  it('marks the part of a passage that falls in each ayah', () => {
    expect(marked(55, 1, 'الرحمن علم القرآن')).toEqual(['ٱلرحمن'])
    expect(marked(55, 2, 'الرحمن علم القرآن')).toEqual(['علم ٱلقرءان'])
    expect(marked(94, 5, 'يسرا إن مع')).toEqual(['يسرا'])
    expect(marked(94, 6, 'يسرا إن مع')).toEqual(['إن مع'])
    expect(marked(1, 3, 'العالمين الرحمن الرحيم مالك')).toEqual(['ٱلرحمن ٱلرحيم'])
  })

  it('shows a short ayah whole', () => {
    const { segments, clippedStart, clippedEnd } = shown(1, 2, 'رب العالمين')

    expect(segments.map((segment) => segment.text).join('')).toBe(textOf(1, 2))
    expect([clippedStart, clippedEnd]).toEqual([false, false])
  })

  it('cuts a long ayah down to the words around its match', () => {
    const text = textOf(2, 282)
    const { segments, clippedStart, clippedEnd } = shown(2, 282, 'واستشهدوا شهيدين')
    const cut = segments.map((segment) => segment.text).join('')

    expect([clippedStart, clippedEnd]).toEqual([true, true])
    expect(cut.split(' ')).toHaveLength(18)
    expect(text).toContain(cut)
    expect(segments.some((segment) => segment.hit)).toBe(true)
  })
})
