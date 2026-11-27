export const PRAYER_SEQUENCE = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export function getPreviousPrayerKey(key) {
  const index = PRAYER_SEQUENCE.indexOf(key)
  return PRAYER_SEQUENCE[(index - 1 + PRAYER_SEQUENCE.length) % PRAYER_SEQUENCE.length]
}

export function getNextPrayerKey(nowMs, timings) {
  if (!timings) return null

  const prayers = PRAYER_SEQUENCE.map((name) => ({
    name,
    time: new Date(timings[name]).getTime(),
  }))

  for (let i = 0; i < prayers.length - 1; i++) {
    if (nowMs >= prayers[i].time && nowMs < prayers[i + 1].time) {
      return prayers[i + 1].name
    }
  }

  return nowMs >= prayers[prayers.length - 1].time || nowMs < prayers[0].time ? prayers[0].name : null
}

export function getPrayerPhase(key, nextKey, nowMs, timings) {
  if (key === nextKey) return 'next'
  if (!timings?.[key]) return 'later'
  return new Date(timings[key]).getTime() <= nowMs ? 'past' : 'later'
}
