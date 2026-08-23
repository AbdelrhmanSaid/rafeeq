import { ensureStorage, readStorage, subscribeStorage, writeStorage } from '@/shared/lib/storage'

/**
 * Zustand middleware that mirrors the given store fields into individual
 * localStorage keys — one key per setting, exactly as the app stored them
 * before, so nothing a user has configured is lost.
 *
 * @param {Object} keys map of store field name to its localStorage key
 */
export const persistFields = (keys) => (initializer) => (set, get, api) => {
  const initial = initializer(set, get, api)
  const entries = Object.entries(keys)
  const state = { ...initial }

  for (const [field, key] of entries) {
    state[field] = readStorage(key, initial[field])
    ensureStorage(key, state[field])

    subscribeStorage(key, () => {
      const stored = readStorage(key, initial[field])
      if (!Object.is(get()[field], stored)) set({ [field]: stored })
    })
  }

  api.subscribe((current, previous) => {
    for (const [field, key] of entries) {
      if (!Object.is(current[field], previous[field])) writeStorage(key, current[field])
    }
  })

  return state
}
