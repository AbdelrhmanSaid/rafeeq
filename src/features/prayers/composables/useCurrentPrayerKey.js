import { computed } from 'vue'
import { formatDate, useNow } from '@vueuse/core'
import { usePrayersStore } from '@/features/prayers/store'
import { calculatePrayerTimes } from '@/features/prayers/lib/prayerTimes'
import { getNextPrayerKey, getPreviousPrayerKey } from '@/features/prayers/lib/prayerPhase'
import { isCoordinate } from '@/features/prayers/lib/coordinates'

// Before Fajr it is still the previous night's Isha.
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
      ...store.calculationSettings,
    })
  })

  return computed(() => {
    const next = getNextPrayerKey(now.value.getTime(), timings.value)
    return next ? getPreviousPrayerKey(next) : null
  })
}
