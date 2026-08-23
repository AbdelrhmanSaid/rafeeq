// The Aladhan timings endpoint takes a DD-MM-YYYY date. It must be the user's
// *local* calendar day: deriving it from toISOString() yields the UTC day,
// which in any zone east of UTC is still "yesterday" for hours after midnight.
export function formatAladhanDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}
