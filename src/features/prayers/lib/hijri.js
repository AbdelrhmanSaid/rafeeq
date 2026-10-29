// Umm al-Qura date parts for the local calendar day of `date`, with Latin digits.
// The formatter is built per call so it always uses the device's current timezone.
export function getHijriDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]))
  return { weekday: parts.weekday, day: parts.day, month: parts.month, year: parts.year }
}
