import { offlineData } from '@/shared/offline/offlineData'
import { cachedFetch } from '@/shared/offline/cachedFetch'
import { API } from '@/shared/constants/api'

export const quranOffline = () => offlineData('quran')

export function fetchSurah(id, { signal } = {}) {
  return cachedFetch(
    quranOffline(),
    id,
    async () => {
      const response = await fetch(`${API.quranCloud}/surah/${id}`, { signal })
      if (!response.ok) throw new Error('Failed to fetch surah')
      return response.json()
    },
    { signal },
  )
}
