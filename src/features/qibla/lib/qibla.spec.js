import { describe, it, expect } from 'vitest'
import {
  normalizeAngle,
  getShortestRotation,
  smoothAngle,
  needleRotation,
  isFacingQibla,
  getQiblaDirection,
  getDistanceToKaaba,
  getTapeTicks,
  headingFromOrientation,
  getDeclination,
  isHeldSideways,
  getBearingUncertainty,
  tiltFromFlat,
  createDriftMonitor,
} from './qibla'

describe('normalizeAngle', () => {
  it('wraps into [0, 360)', () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(360)).toBe(0)
    expect(normalizeAngle(-90)).toBe(270)
    expect(normalizeAngle(450)).toBe(90)
  })
})

describe('getShortestRotation', () => {
  it('returns the signed shortest path', () => {
    expect(getShortestRotation(0, 90)).toBe(90)
    expect(getShortestRotation(0, 270)).toBe(-90)
    expect(getShortestRotation(350, 10)).toBe(20)
    expect(getShortestRotation(10, 350)).toBe(-20)
  })
})

describe('smoothAngle', () => {
  it('moves a fraction of the way toward the target', () => {
    expect(smoothAngle(0, 100, 0.1)).toBeCloseTo(10)
  })

  it('takes the short way across the 0/360 seam', () => {
    expect(smoothAngle(350, 10, 0.1)).toBeCloseTo(352)
  })
})

describe('needleRotation', () => {
  it('is the qibla bearing minus the device heading', () => {
    expect(needleRotation(120, 0)).toBe(120)
    expect(needleRotation(10, 30)).toBe(340)
    expect(needleRotation(null, 50)).toBe(0)
  })
})

describe('isFacingQibla', () => {
  it('is true within tolerance of 0/360', () => {
    expect(isFacingQibla(0, 15)).toBe(true)
    expect(isFacingQibla(10, 15)).toBe(true)
    expect(isFacingQibla(350, 15)).toBe(true)
    expect(isFacingQibla(30, 15)).toBe(false)
    expect(isFacingQibla(180, 15)).toBe(false)
  })
})

describe('getQiblaDirection', () => {
  // Reference bearings on the WGS84 ellipsoid, worked out separately with Vincenty's inverse formula.
  it.each([
    ['Cairo', 30.0444, 31.2357, 135.982],
    ['Riyadh', 24.7136, 46.6753, 243.932],
    ['Istanbul', 41.0082, 28.9784, 151.514],
    ['London', 51.5074, -0.1278, 118.868],
    ['New York', 40.7128, -74.006, 58.396],
    ['Jakarta', -6.2088, 106.8456, 295.025],
    ['Sydney', -33.8688, 151.2093, 277.319],
    ['Tokyo', 35.6762, 139.6503, 293.072],
    ['Cape Town', -33.9249, 18.4241, 23.467],
    ['Los Angeles', 34.0522, -118.2437, 23.769],
    ['Reykjavik', 64.1466, -21.9426, 106.027],
    ['São Paulo', -23.5505, -46.6333, 69.094],
  ])('gives the bearing to the Kaaba from %s', (_city, latitude, longitude, bearing) => {
    expect(getQiblaDirection(latitude, longitude)).toBeCloseTo(bearing, 2)
  })

  it("points due north or south along the Kaaba's own meridian", () => {
    expect(getQiblaDirection(0, 39.8261818)).toBeCloseTo(0, 6)
    expect(getQiblaDirection(50, 39.8261818)).toBeCloseTo(180, 6)
  })

  it('accepts coordinates saved as text', () => {
    expect(getQiblaDirection('30.0444', '31.2357')).toBeCloseTo(135.982, 2)
  })

  it('is not a number for a location that is not one', () => {
    expect(Number.isFinite(getQiblaDirection(Number.NaN, 31))).toBe(false)
  })
})

describe('getDistanceToKaaba', () => {
  it('is 1,286 km from Cairo', () => {
    expect(getDistanceToKaaba(30.0444, 31.2357)).toBeCloseTo(1285.6, 0)
  })

  it('is zero at the Kaaba', () => {
    expect(getDistanceToKaaba(21.4225241, 39.8261818)).toBeCloseTo(0)
  })
})

describe('getBearingUncertainty', () => {
  it('is small far from Makkah and large close to it for the same location error', () => {
    expect(getBearingUncertainty(20000, 1285)).toBeCloseTo(0.89, 1)
    expect(getBearingUncertainty(20000, 65)).toBeCloseTo(17.1, 0)
    expect(getBearingUncertainty(10, 1285)).toBeLessThan(0.001)
  })

  it('is unknown when the accuracy or the distance is', () => {
    expect(getBearingUncertainty(null, 1285)).toBe(null)
    expect(getBearingUncertainty(50, null)).toBe(null)
  })
})

describe('tiltFromFlat', () => {
  it('is how far the phone is tipped from lying flat, whichever way', () => {
    expect(tiltFromFlat(0, 0)).toBeCloseTo(0)
    expect(tiltFromFlat(45, 0)).toBeCloseTo(45)
    expect(tiltFromFlat(-45, 0)).toBeCloseTo(45)
    expect(tiltFromFlat(0, 30)).toBeCloseTo(30)
    expect(tiltFromFlat(90, 0)).toBeCloseTo(90)
    expect(tiltFromFlat(120, 0)).toBeCloseTo(120)
  })
})

describe('createDriftMonitor', () => {
  it('reports no drift while the gap holds still', () => {
    const drift = createDriftMonitor()

    expect(drift.add(40, 0)).toBe(0)
    expect(drift.add(41, 1000)).toBeCloseTo(1)
    expect(drift.add(40, 2000)).toBeCloseTo(1)
  })

  it('reports how far the gap has wandered, across the 0/360 seam too', () => {
    const drift = createDriftMonitor()
    drift.add(350, 0)

    expect(drift.add(15, 1000)).toBeCloseTo(25)
  })

  it('forgets what happened before its window', () => {
    const drift = createDriftMonitor({ windowMs: 10000 })
    drift.add(0, 0)
    drift.add(30, 1000)

    expect(drift.add(30, 10500)).toBeCloseTo(0)
    expect(drift.add(30, 12000)).toBeCloseTo(0)
  })

  it('takes one sample at a time, not every reading', () => {
    const drift = createDriftMonitor({ everyMs: 200 })
    drift.add(0, 0)

    expect(drift.add(90, 50)).toBe(0)
  })

  it('starts over after a reset', () => {
    const drift = createDriftMonitor()
    drift.add(0, 0)
    drift.add(30, 1000)
    drift.reset()

    expect(drift.add(60, 2000)).toBe(0)
  })
})

describe('getTapeTicks', () => {
  it('lists ticks around the heading with their offsets', () => {
    const ticks = getTapeTicks(112, 20, 10)

    expect(ticks.map((tick) => tick.degree)).toEqual([100, 110, 120, 130])
    expect(ticks.map((tick) => tick.offset)).toEqual([-12, -2, 8, 18])
  })

  it('wraps past north', () => {
    const ticks = getTapeTicks(355, 10, 5)

    expect(ticks.map((tick) => tick.degree)).toEqual([345, 350, 355, 0, 5])
  })
})

describe('headingFromOrientation', () => {
  it('reads 360 - alpha while the phone lies flat', () => {
    expect(headingFromOrientation(90, 0, 0)).toBeCloseTo(270)
    expect(headingFromOrientation(0, 0, 0)).toBeCloseTo(0)
  })

  it('reads where the back faces when the phone is held up', () => {
    expect(headingFromOrientation(30, 90, 0)).toBeCloseTo(330)
    expect(headingFromOrientation(90, 60, 0)).toBeCloseTo(270)
  })

  it('gives one heading for both ways a browser can report the same pose', () => {
    const heading = headingFromOrientation(200, 80, 30)

    expect(headingFromOrientation(200 + 180 - 360, 180 - 80, 30 - 180)).toBeCloseTo(heading)
  })

  it('changes smoothly as a slightly twisted phone tilts from flat to upright', () => {
    let previous = headingFromOrientation(0, 0, 15)
    for (let beta = 1; beta <= 90; beta += 1) {
      const heading = headingFromOrientation(0, beta, 15)
      expect(Math.abs(getShortestRotation(previous, heading))).toBeLessThan(1)
      previous = heading
    }
  })
})

describe('isHeldSideways', () => {
  it('is false held flat or upright, true on its side', () => {
    expect(isHeldSideways(0, 0)).toBe(false)
    expect(isHeldSideways(80, 10)).toBe(false)
    expect(isHeldSideways(0, 85)).toBe(true)
  })
})

describe('normalizeAngle with bad input', () => {
  it('reads anything that is not a finite number as north', () => {
    expect(normalizeAngle(Number.NaN)).toBe(0)
    expect(normalizeAngle(Number.POSITIVE_INFINITY)).toBe(0)
    expect(normalizeAngle(-725)).toBe(355)
  })
})

describe('getDeclination', () => {
  // Reference values from the World Magnetic Model 2025 for late 2026.
  it('matches the magnetic declination for known cities', () => {
    const date = new Date('2026-11-27')

    expect(getDeclination(30.0444, 31.2357, date)).toBeCloseTo(4.8, 0)
    expect(getDeclination(40.7128, -74.006, date)).toBeCloseTo(-12.5, 0)
    expect(getDeclination(24.7136, 46.6753, date)).toBeCloseTo(3.1, 0)
  })

  it('is unknown, not zero, when it cannot be worked out', () => {
    expect(getDeclination(Number.NaN, 31)).toBe(null)
  })
})
