import { describe, it, expect } from 'vitest'
import { normalizeAngle, getShortestRotation, smoothAngle, needleRotation, isFacingQibla } from './qibla'

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
    // from 350 toward 10 is +20; 10% of that is +2 -> 352
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
