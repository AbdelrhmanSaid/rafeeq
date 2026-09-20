export const normalize = (text) => {
  text = String(text).replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '')

  text = text.replace(/(آ|إ|أ)/g, 'ا')
  text = text.replace(/(ة)/g, 'ه')
  text = text.replace(/(ئ|ؤ)/g, 'ء')
  text = text.replace(/(ى)/g, 'ي')

  for (let i = 0; i < 10; i++) {
    text = text.replaceAll(String.fromCharCode(0x660 + i), String.fromCharCode(48 + i))
  }

  return text.toLowerCase()
}

// Normalize unsupported Quranic glyphs in UI metadata, not Quran text.
export const normalizeQuranicText = (text) =>
  String(text ?? '')
    .replace(/\u06e1/gu, '\u0652')
    .replace(/\u0671/gu, '\u0627')
    .normalize('NFC')

export const BISMILLAH_VARIANTS = [
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',
  'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',
]

export const removeBismillah = (text) => {
  text = String(text ?? '').replace(/^\uFEFF/, '')

  for (const sample of BISMILLAH_VARIANTS) {
    text = text.replace(new RegExp(`^${sample}\\s*`, 'u'), '').trim()
  }

  return text
}

// Match the API's vocalized surah prefix after stripping diacritics.
export const removeSurahPrefix = (name) => {
  const text = String(name ?? '').trim()
  const [first, ...rest] = text.split(/\s+/)
  const bare = first.replace(/[\u064b-\u0652\u0670\u0640]/g, '')
  return bare === 'سورة' && rest.length ? rest.join(' ') : text
}

export const toArabicNumerals = (value) => {
  return String(value).replace(/\d/g, (digit) => String.fromCharCode(0x660 + Number(digit)))
}

export const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return '٠٠:٠٠:٠٠'
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')

  return toArabicNumerals(`${h}:${m}:${s}`)
}
