import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { usePrayersStore } from './store'

vi.mock('@/shared/composables/useGeolocation', () => ({ getCurrentPosition: vi.fn() }))

beforeEach(() => {
  localStorage.setItem('latitude', '30.0444')
  localStorage.setItem('longitude', '31.2357')
  setActivePinia(createPinia())
})

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('prayers store detect', () => {
  it('keeps the saved location when a new fix is refused', async () => {
    getCurrentPosition.mockRejectedValue({ code: 1 })
    const store = usePrayersStore()

    expect(await store.detect()).toEqual({ ok: false, code: 1 })
    expect(store.latitude).toBe(30.0444)
    expect(store.longitude).toBe(31.2357)
    expect(localStorage.getItem('latitude')).toBe('30.0444')
  })

  it('saves a new fix as numbers, the way they read back after a reload', async () => {
    getCurrentPosition.mockResolvedValue({ coords: { latitude: 21.42251234, longitude: 39.82620009 } })
    const store = usePrayersStore()

    expect(await store.detect()).toEqual({ ok: true })
    expect(store.latitude).toBe(21.422512)
    expect(store.longitude).toBe(39.8262)

    setActivePinia(createPinia())
    expect(usePrayersStore().latitude).toBe(21.422512)
  })
})
