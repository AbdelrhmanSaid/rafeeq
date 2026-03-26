import { useOfflineData } from '@/composables/useOfflineData'

let _instance = null

export function useHadithService() {
  if (!_instance) {
    const offline = useOfflineData('hadith')

    async function fetchHadith(id) {
      // const cached = await offline.get(id)
      // if (cached) return cached

      const response = await fetch(`/data/hadith/${id}.json`)
      if (!response.ok) throw new Error('Failed to fetch hadith')
      const data = await response.json()

      // await offline.save(id, data)
      return data
    }

    _instance = { ...offline, fetchHadith }
  }

  return _instance
}
