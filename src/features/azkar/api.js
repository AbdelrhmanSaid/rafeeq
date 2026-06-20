import { useOfflineData } from '@/shared/offline/useOfflineData'
import { cachedFetch } from '@/shared/offline/cachedFetch'
import { API } from '@/shared/constants/api'

export const azkarOffline = () => useOfflineData('azkar')

export function fetchCategory(slug) {
  return cachedFetch(azkarOffline(), slug, async () => {
    const response = await fetch(`${API.azkarData}/${slug}.json`)
    if (!response.ok) throw new Error('Failed to fetch azkar')
    return response.json()
  })
}
