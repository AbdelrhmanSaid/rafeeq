export const normalize = (text) => {
  text = String(text).replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '')

  text = text.replace(/(آ|إ|أ)/g, 'ا')
  text = text.replace(/(ة)/g, 'ه')
  text = text.replace(/(ئ|ؤ)/g, 'ء')
  text = text.replace(/(ى)/g, 'ي')

  for (let i = 0; i < 10; i++) {
    text.replace(String.fromCharCode(0x660 + i), String.fromCharCode(48 + i))
  }

  return text.toLowerCase()
}

export const toArabicNumber = (text) => {
  return String(text).replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 0x660 - 0x30))
}

export const matchNumber = (number, singular, plural, dual = null) => {
  number = Math.abs(number)

  if (number === 2) {
    return dual || plural
  }

  if (number > 2 && number < 11) {
    return plural
  }

  return singular
}
