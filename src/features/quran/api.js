import { useOfflineData } from '@/shared/offline/useOfflineData'
import { cachedFetch } from '@/shared/offline/cachedFetch'
import { API } from '@/shared/constants/api'

export const quranOffline = () => useOfflineData('quran')

export function fetchSurah(id) {
  return cachedFetch(quranOffline(), id, async () => {
    const response = await fetch(`${API.quranCloud}/surah/${id}`)
    if (!response.ok) throw new Error('Failed to fetch surah')
    return response.json()
  })
}
