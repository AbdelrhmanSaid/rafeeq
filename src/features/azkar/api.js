import { useOfflineData } from '@/shared/offline/useOfflineData'
import { cachedFetch } from '@/shared/offline/cachedFetch'
import { API } from '@/shared/constants/api'
import categories from '@/features/azkar/data/categories.js'

export const azkarOffline = () => useOfflineData('azkar')

export const isKnownCategory = (slug) => categories.some((category) => category.slug === slug)

// An unknown slug resolves to null (the "not found" state) without a request: the SPA fallback would answer it with
// index.html and a 200, which then fails as JSON and reads as a load error whose retry can never work.
export function fetchCategory(slug) {
  if (!isKnownCategory(slug)) return Promise.resolve(null)

  return cachedFetch(azkarOffline(), slug, async () => {
    const response = await fetch(`${API.azkarData}/${slug}.json`)
    if (!response.ok) throw new Error('Failed to fetch azkar')
    return response.json()
  })
}
