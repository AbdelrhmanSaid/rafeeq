import { offlineData } from '@/shared/offline/offlineData'
import { cachedFetch } from '@/shared/offline/cachedFetch'
import { API } from '@/shared/constants/api'

export const azkarOffline = () => offlineData('azkar')

export function fetchCategory(slug, { signal } = {}) {
  return cachedFetch(
    azkarOffline(),
    slug,
    async () => {
      const response = await fetch(`${API.azkarData}/${slug}.json`, { signal })
      if (!response.ok) throw new Error('Failed to fetch azkar')
      return response.json()
    },
    { signal },
  )
}
