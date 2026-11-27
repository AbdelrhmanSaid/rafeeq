// The Mushaf is Hafs, so only Hafs recordings (murattal or mujawwad) line up with its ayat.
const HAFS = new Set(['حفص عن عاصم', 'المصحف المجود'])

export const normalizeRewaya = (rewaya) => rewaya.replace(/\s+/g, ' ').trim()

export const isHafsRecording = (reciter) => Boolean(reciter) && HAFS.has(normalizeRewaya(reciter.rewaya))

// Tells apart one reciter's recordings (Abdul Basit has a murattal and a mujawwad).
export function recordingStyle(reciter) {
  if (!reciter) return ''
  if (reciter.rewaya.includes('المجود')) return 'مجوّد'
  return isHafsRecording(reciter) ? '' : normalizeRewaya(reciter.rewaya)
}
