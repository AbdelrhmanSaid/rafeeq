import { beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePrayersStore } from './store'

function setGeolocation(value) {
  Object.defineProperty(globalThis.navigator, 'geolocation', { value, configurable: true })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('vertical layout', () => {
  it('follows the explicit layout choice', () => {
    const store = usePrayersStore()

    store.layout = 'list'
    expect(store.vertical).toBe(true)

    store.layout = 'cards'
    expect(store.vertical).toBe(false)
  })
})

describe('detect', () => {
  it('stores the detected coordinates rounded to six decimals', async () => {
    setGeolocation({
      getCurrentPosition: (ok) => ok({ coords: { longitude: 31.1234567, latitude: 30.7654321 } }),
    })
    const store = usePrayersStore()

    const result = await store.detect()

    expect(result).toEqual({ ok: true })
    expect(store.longitude).toBe('31.123457')
    expect(store.latitude).toBe('30.765432')
    expect(store.isDetecting).toBe(false)
  })

  it('clears coordinates and surfaces the error code on failure', async () => {
    setGeolocation({
      getCurrentPosition: (_ok, fail) => fail({ code: 1 }),
    })
    const store = usePrayersStore()
    store.longitude = '10'
    store.latitude = '20'

    const result = await store.detect()

    expect(result).toEqual({ ok: false, code: 1 })
    expect(store.longitude).toBe(0)
    expect(store.latitude).toBe(0)
    expect(store.isDetecting).toBe(false)
  })
})

describe('clear', () => {
  it('resets coordinates to zero', () => {
    const store = usePrayersStore()
    store.longitude = '10'
    store.latitude = '20'

    store.clear()

    expect(store.longitude).toBe(0)
    expect(store.latitude).toBe(0)
  })
})
