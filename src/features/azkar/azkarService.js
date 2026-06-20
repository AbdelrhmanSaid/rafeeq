import { useOfflineData } from '@/shared/offline/useOfflineData'
import { API } from '@/shared/constants/api'

let _instance = null

export function useAzkarService() {
  if (!_instance) {
    const offline = useOfflineData('azkar')

    async function fetchCategory(slug) {
      const cached = await offline.get(slug)
      if (cached) return cached

      const response = await fetch(`${API.azkarData}/${slug}.json`)
      if (!response.ok) throw new Error('Failed to fetch azkar')
      const data = await response.json()

      await offline.save(slug, data)
      return data
    }

    _instance = { ...offline, fetchCategory }
  }

  return _instance
}
