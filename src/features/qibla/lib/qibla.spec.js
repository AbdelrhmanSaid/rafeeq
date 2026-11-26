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
  it('returns the bearing to the Kaaba', () => {
    expect(getQiblaDirection(30.0444, 31.2357)).toBeCloseTo(136.1, 1)
    expect(getQiblaDirection(40.7128, -74.006)).toBeCloseTo(58.5, 1)
  })
})

describe('getDistanceToKaaba', () => {
  it('is about 1,290 km from Cairo', () => {
    expect(getDistanceToKaaba(30.0444, 31.2357)).toBeCloseTo(1290, -1)
  })

  it('is zero at the Kaaba', () => {
    expect(getDistanceToKaaba(21.4225, 39.8262)).toBeCloseTo(0)
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
})
