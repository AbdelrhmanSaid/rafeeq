const normalize = (text) => {
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

const toArabicNumerals = (value) =>
  String(value).replace(/\d/g, (digit) => String.fromCharCode(0x660 + Number(digit)))

export { toArabicNumerals }

export default { normalize, toArabicNumerals }
