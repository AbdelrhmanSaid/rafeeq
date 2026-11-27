import { describe, it, expect } from 'vitest'
import { getSunPosition } from './sun'
import { getQiblaDirection, getShortestRotation } from './qibla'

describe('getSunPosition', () => {
  // Checked against adhan's solar coordinates, which agree to a thousandth of a degree.
  it('places the sun just past south at midday in Cairo', () => {
    const sun = getSunPosition(new Date('2026-11-27T10:00:00Z'), 30.0444, 31.2357)

    expect(sun.azimuth).toBeCloseTo(185.18, 1)
    expect(sun.altitude).toBeCloseTo(38.63, 1)
  })

  it('puts the sun below the horizon at night', () => {
    expect(getSunPosition(new Date('2026-11-27T22:00:00Z'), 30.0444, 31.2357).altitude).toBeLessThan(0)
  })

  it('rises in the east and sets in the west at an equinox on the equator', () => {
    expect(getSunPosition(new Date('2027-03-20T06:00:00Z'), 0, 0).azimuth).toBeCloseTo(90, 0)
    expect(getSunPosition(new Date('2027-03-20T18:00:00Z'), 0, 0).azimuth).toBeCloseTo(270, 0)
  })

  // Twice a year the sun passes straight over the Kaaba; at that moment its direction from anywhere is the qibla.
  describe('when the sun is over the Kaaba', () => {
    const overhead = new Date('2026-05-28T09:18:00Z')

    it('stands at the zenith there', () => {
      expect(getSunPosition(overhead, 21.4225241, 39.8261818).altitude).toBeGreaterThan(89.8)
    })

    it.each([
      ['Cairo', 30.0444, 31.2357],
      ['London', 51.5074, -0.1278],
      ['Istanbul', 41.0082, 28.9784],
      ['Jakarta', -6.2088, 106.8456],
    ])('lies along the qibla from %s', (_city, latitude, longitude) => {
      const sun = getSunPosition(overhead, latitude, longitude)

      expect(Math.abs(getShortestRotation(sun.azimuth, getQiblaDirection(latitude, longitude)))).toBeLessThan(0.3)
    })
  })
})
