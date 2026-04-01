export const normalize = (text) => {
  // Get only Arabic characters, English characters, and numbers
  text = String(text).replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '')

  // Normalize Arabic characters
  text = text.replace(/(آ|إ|أ)/g, 'ا')
  text = text.replace(/(ة)/g, 'ه')
  text = text.replace(/(ئ|ؤ)/g, 'ء')
  text = text.replace(/(ى)/g, 'ي')

  for (let i = 0; i < 10; i++) {
    // Replace Arabic numbers with English numbers
    text = text.replaceAll(String.fromCharCode(0x660 + i), String.fromCharCode(48 + i))
  }

  return text.toLowerCase()
}

export const removeBismillah = (text) => {
  return text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u, '').trim()
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
