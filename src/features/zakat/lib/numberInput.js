const ARABIC_ZERO = 0x0660
const PERSIAN_ZERO = 0x06f0
const DECIMAL_SIGNS = new Set(['.', '٫'])

function toDigit(char) {
  const code = char.charCodeAt(0)
  if (char >= '0' && char <= '9') return char
  if (code >= ARABIC_ZERO && code <= ARABIC_ZERO + 9) return String(code - ARABIC_ZERO)
  if (code >= PERSIAN_ZERO && code <= PERSIAN_ZERO + 9) return String(code - PERSIAN_ZERO)
  return null
}

export function normalizeNumberInput(text, caret = text.length, { integer = false } = {}) {
  let value = ''
  let newCaret = 0
  let hasDecimal = false

  Array.from(String(text)).forEach((char, index) => {
    const digit = toDigit(char)
    let kept = digit

    if (digit == null && DECIMAL_SIGNS.has(char) && !integer && !hasDecimal) {
      hasDecimal = true
      kept = '.'
    }

    if (kept == null) return
    value += kept
    if (index < caret) newCaret = value.length
  })

  return { value, caret: newCaret }
}

// Maps one character to one character, so caret positions carry over unchanged.
export function toInputDisplay(value) {
  return String(value ?? '')
    .replace(/\d/g, (digit) => String.fromCharCode(ARABIC_ZERO + Number(digit)))
    .replace('.', '٫')
}
