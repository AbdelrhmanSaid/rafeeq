import { useOfflineData } from '@/shared/offline/useOfflineData'
import { cachedFetch } from '@/shared/offline/cachedFetch'
import { API } from '@/shared/constants/api'

// Namespace 'mushaf' (not the legacy 'quran') — payloads are the pre-generated
// QCF V1 word-glyph JSONs, incompatible with the old alquran.cloud shape.
export const quranOffline = () => useOfflineData('mushaf')

export function fetchSurah(id) {
  return cachedFetch(quranOffline(), id, async () => {
    const response = await fetch(`${API.quranData}/${id}.json`)
    if (!response.ok) throw new Error('Failed to fetch surah')
    return response.json()
  })
}
