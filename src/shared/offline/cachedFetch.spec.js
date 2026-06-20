import { describe, it, expect, vi } from 'vitest'
import { cachedFetch } from './cachedFetch'

function fakeOffline(initial = {}) {
  const store = { ...initial }
  return {
    get: vi.fn(async (k) => store[k]),
    save: vi.fn(async (k, v) => {
      store[k] = v
    }),
  }
}

describe('cachedFetch', () => {
  it('returns the cached value without invoking the fetcher', async () => {
    const offline = fakeOffline({ 1: { cached: true } })
    const fetcher = vi.fn()

    const result = await cachedFetch(offline, 1, fetcher)

    expect(result).toEqual({ cached: true })
    expect(fetcher).not.toHaveBeenCalled()
    expect(offline.save).not.toHaveBeenCalled()
  })

  it('fetches, caches, and returns on a cache miss', async () => {
    const offline = fakeOffline()
    const fetcher = vi.fn(async () => ({ fresh: true }))

    const result = await cachedFetch(offline, 'k', fetcher)

    expect(result).toEqual({ fresh: true })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(offline.save).toHaveBeenCalledWith('k', { fresh: true })
  })
})
