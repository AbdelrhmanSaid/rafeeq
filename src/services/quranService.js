import { useOfflineData } from '@/composables/useOfflineData'

let _instance = null

export function useQuranService() {
  if (!_instance) {
    const offline = useOfflineData('quran')

    async function fetchSurah(id) {
      const cached = await offline.get(id)
      if (cached) return cached

      const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}`)
      if (!response.ok) throw new Error('Failed to fetch surah')
      const data = await response.json()

      await offline.save(id, data)
      return data
    }

    _instance = { ...offline, fetchSurah }
  }

  return _instance
}
