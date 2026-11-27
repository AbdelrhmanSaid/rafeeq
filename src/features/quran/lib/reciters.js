// The Mushaf is the Hafs reading, so only Hafs recordings (murattal or mujawwad) line up with its ayat; others play,
// but without following the ayah.
const HAFS = new Set(['حفص عن عاصم', 'المصحف المجود'])

export const normalizeRewaya = (rewaya) => rewaya.replace(/\s+/g, ' ').trim()

export const isHafsRecording = (reciter) => Boolean(reciter) && HAFS.has(normalizeRewaya(reciter.rewaya))

// What sets a recording apart in the reciter list and the player, where one reciter can have two (Abdul Basit has a
// murattal and a mujawwad): "مجوّد" for a mujawwad, the riwaya for one not in Hafs, nothing for a plain Hafs one.
export function recordingStyle(reciter) {
  if (!reciter) return ''
  if (reciter.rewaya.includes('المجود')) return 'مجوّد'
  return isHafsRecording(reciter) ? '' : normalizeRewaya(reciter.rewaya)
}
