import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))

import { usePrayersStore } from '@/stores/prayers'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('prayers store', () => {
  it('has sensible defaults', () => {
    const store = usePrayersStore()
    expect(store.longitude).toBe(0)
    expect(store.latitude).toBe(0)
    expect(store.vertical).toBe(false)
    expect(store.isDetecting).toBe(false)
  })

  it('detect() stores rounded coordinates on success', () => {
    const getCurrentPosition = vi.fn((success) =>
      success({ coords: { longitude: 31.123456789, latitude: 30.987654321 } }),
    )
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } })

    const store = usePrayersStore()
    store.detect()

    expect(store.longitude).toBe('31.123457')
    expect(store.latitude).toBe('30.987654')
    expect(store.isDetecting).toBe(false)
    expect(toast.success).toHaveBeenCalled()
  })

  it('detect() handles a permission-denied error and clears coordinates', () => {
    const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }))
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } })

    const store = usePrayersStore()
    store.longitude = 10
    store.latitude = 20
    store.detect()

    expect(store.longitude).toBe(0)
    expect(store.latitude).toBe(0)
    expect(store.isDetecting).toBe(false)
    expect(toast.error).toHaveBeenCalled()
  })

  it('clear() resets the coordinates', () => {
    const store = usePrayersStore()
    store.longitude = 5
    store.latitude = 6
    store.clear()
    expect(store.longitude).toBe(0)
    expect(store.latitude).toBe(0)
  })
})
