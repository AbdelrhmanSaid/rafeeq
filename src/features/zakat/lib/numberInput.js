// The amount fields take digits however the keyboard sends them: Western, Arabic-Indic (٠–٩) or Persian (۰–۹), with
// "." or the Arabic decimal sign "٫" as the decimal point. Grouping marks ("," and "٬") and anything else are dropped.

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

// The typed text as a plain number string ("1234.5") the calculations can parse, and where the caret lands in it, so a
// dropped character doesn't throw the caret to the end. Counts (integer) take no decimal point.
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

// The number as the field shows it: Arabic-Indic digits and the Arabic decimal sign, one character for each in the
// plain string, so caret positions carry over unchanged.
export function toInputDisplay(value) {
  return String(value ?? '')
    .replace(/\d/g, (digit) => String.fromCharCode(ARABIC_ZERO + Number(digit)))
    .replace('.', '٫')
}
