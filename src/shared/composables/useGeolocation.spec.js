import { describe, it, expect } from 'vitest'
import { getCurrentPosition } from './useGeolocation'

function setGeolocation(value) {
  Object.defineProperty(globalThis.navigator, 'geolocation', { value, configurable: true })
}

describe('getCurrentPosition', () => {
  it('resolves with the native position', async () => {
    const position = { coords: { latitude: 1, longitude: 2 } }
    setGeolocation({ getCurrentPosition: (ok) => ok(position) })

    await expect(getCurrentPosition()).resolves.toBe(position)
  })

  it('rejects with the native error (carrying its code)', async () => {
    const error = { code: 1, message: 'denied' }
    setGeolocation({ getCurrentPosition: (_ok, fail) => fail(error) })

    await expect(getCurrentPosition()).rejects.toBe(error)
  })

  it('rejects when geolocation is unavailable', async () => {
    setGeolocation(undefined)

    await expect(getCurrentPosition()).rejects.toThrow('not supported')
  })
})
