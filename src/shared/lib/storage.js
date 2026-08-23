// Single gateway to localStorage. Values are encoded the way the app has always
// encoded them (strings raw, everything else JSON) so settings saved by earlier
// versions keep working, and every read/write flows through one subscribable
// registry so all consumers of a key stay in sync.

const listeners = new Map()
const cache = new Map()

const isBrowser = typeof window !== 'undefined'

function parse(raw, fallback) {
  if (typeof fallback === 'string') return raw

  try {
    const value = JSON.parse(raw)
    return value === undefined ? fallback : value
  } catch {
    return fallback
  }
}

function stringify(value) {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function notify(key) {
  listeners.get(key)?.forEach((listener) => listener())
}

export function subscribeStorage(key, listener) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(listener)

  return () => {
    listeners.get(key)?.delete(listener)
  }
}

// Returns the stored value, or `fallback` when the key is absent. Parsed values
// are cached by their raw string so repeated reads keep a stable identity —
// required by useSyncExternalStore.
export function readStorage(key, fallback) {
  if (!isBrowser) return fallback

  const raw = localStorage.getItem(key)
  if (raw === null) return fallback

  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.value

  const value = parse(raw, fallback)
  cache.set(key, { raw, value })

  return value
}

export function writeStorage(key, value) {
  if (!isBrowser) return

  const raw = stringify(value)
  localStorage.setItem(key, raw)
  cache.set(key, { raw, value })
  notify(key)
}

// Writes `value` only when the key has never been set, mirroring how the app
// has always seeded defaults into storage.
export function ensureStorage(key, value) {
  if (isBrowser && localStorage.getItem(key) === null) writeStorage(key, value)
}

export function removeStorage(key) {
  if (!isBrowser) return

  localStorage.removeItem(key)
  cache.delete(key)
  notify(key)
}

// Changes made in another tab arrive as `storage` events.
if (isBrowser) {
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      cache.clear()
      listeners.forEach((_, key) => notify(key))
      return
    }

    cache.delete(event.key)
    notify(event.key)
  })
}
