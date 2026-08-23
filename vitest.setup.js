import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom under Vitest exposes sessionStorage but not localStorage (Node's own
// experimental global shadows it), so tests get a minimal in-memory Storage
// that behaves like the browser's.
function createMemoryStorage() {
  const entries = new Map()

  return {
    get length() {
      return entries.size
    },
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => (entries.has(String(key)) ? entries.get(String(key)) : null),
    setItem: (key, value) => entries.set(String(key), String(value)),
    removeItem: (key) => entries.delete(String(key)),
    clear: () => entries.clear(),
  }
}

if (!window.localStorage) {
  const storage = createMemoryStorage()

  for (const target of [window, globalThis]) {
    Object.defineProperty(target, 'localStorage', { value: storage, configurable: true })
  }
}

// jsdom has no media query engine; nothing under test depends on a match.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })
}

afterEach(cleanup)
