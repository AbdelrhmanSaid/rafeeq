import { computed } from 'vue'
import { formatDate, useNow } from '@vueuse/core'
import { usePrayersStore } from '@/features/prayers/store'
import { calculatePrayerTimes } from '@/features/prayers/lib/prayerTimes'
import { getNextPrayerKey, PRAYER_SEQUENCE } from '@/features/prayers/lib/prayerPhase'

const isCoordinate = (value) => Number.isFinite(Number(value)) && Number(value) !== 0

// The prayer whose time has most recently started (Fajr…Isha, or Sunrise) for the saved location.
// Before Fajr it's still the previous night's Isha. Null when no location is set.
export function useCurrentPrayerKey() {
  const store = usePrayersStore()
  const now = useNow({ interval: 60_000 })
  const today = computed(() => formatDate(now.value, 'YYYY-MM-DD'))

  const timings = computed(() => {
    if (!isCoordinate(store.latitude) || !isCoordinate(store.longitude)) return null

    return calculatePrayerTimes({
      latitude: store.latitude,
      longitude: store.longitude,
      date: new Date(`${today.value}T00:00:00`),
      method: store.calcMethod,
      school: store.calcSchool,
      latitudeAdjustment: store.calcLatitudeAdjustment,
      shafaq: store.calcShafaq,
    })
  })

  return computed(() => {
    const next = getNextPrayerKey(now.value.getTime(), timings.value)
    if (!next) return null

    const index = PRAYER_SEQUENCE.indexOf(next)
    return PRAYER_SEQUENCE[(index - 1 + PRAYER_SEQUENCE.length) % PRAYER_SEQUENCE.length]
  })
}
