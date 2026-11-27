// The Mushaf is the Hafs reading, so only Hafs recordings (murattal or mujawwad) line up with its ayat; others play,
// but without following the ayah.
const HAFS = new Set(['حفص عن عاصم', 'المصحف المجود'])

export const isHafsRecording = (reciter) => Boolean(reciter) && HAFS.has(reciter.rewaya.replace(/\s+/g, ' ').trim())
