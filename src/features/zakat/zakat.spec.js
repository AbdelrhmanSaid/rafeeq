import { describe, it, expect } from 'vitest'
import {
  NISAB,
  goldPriceNisab,
  moneyZakat,
  goldZakat,
  silverZakat,
  cropsZakat,
  businessZakat,
  livestockZakat,
} from './zakat'

describe('goldPriceNisab', () => {
  it('derives nisab from a live gold price', () => {
    expect(goldPriceNisab(3000, NISAB.money)).toBe(3000 * NISAB.gold)
  })

  it('falls back when the price is empty or non-positive', () => {
    expect(goldPriceNisab('', 2156.25)).toBe(2156.25)
    expect(goldPriceNisab(0, 2156.25)).toBe(2156.25)
    expect(goldPriceNisab(-5, 2156.25)).toBe(2156.25)
  })
})

describe('monetary zakat (2.5% above nisab)', () => {
  it('returns 0 below nisab and 2.5% at or above', () => {
    expect(moneyZakat(2000, NISAB.money)).toBe(0)
    expect(moneyZakat(NISAB.money, NISAB.money)).toBeCloseTo(53.90625)
    expect(moneyZakat(10000, NISAB.money)).toBe(250)
    expect(moneyZakat('', NISAB.money)).toBe(0)
  })

  it('applies the same rule to business assets', () => {
    expect(businessZakat(2000, NISAB.business)).toBe(0)
    expect(businessZakat(10000, NISAB.business)).toBe(250)
  })
})

describe('gold and silver zakat', () => {
  it('gold: 0 below 85g, 2.5% at or above', () => {
    expect(goldZakat(84)).toBe(0)
    expect(goldZakat(85)).toBeCloseTo(2.125)
    expect(goldZakat(100)).toBe(2.5)
  })

  it('silver: 0 below 595g, 2.5% at or above', () => {
    expect(silverZakat(594)).toBe(0)
    expect(silverZakat(595)).toBeCloseTo(14.875)
  })
})

describe('crops zakat (5% baseline above 653kg)', () => {
  it('returns 0 below nisab and 5% at or above', () => {
    expect(cropsZakat(652)).toBe(0)
    expect(cropsZakat(653)).toBeCloseTo(32.65)
    expect(cropsZakat(1000)).toBe(50)
  })
})

describe('livestock zakat (paid in heads)', () => {
  it('cows: one head per 30, zero below', () => {
    expect(livestockZakat({ cows: 29 })).toBe(0)
    expect(livestockZakat({ cows: 30 })).toBe(1)
    expect(livestockZakat({ cows: 60 })).toBe(2)
  })

  it('sheep: graduated thresholds', () => {
    expect(livestockZakat({ sheep: 39 })).toBe(0)
    expect(livestockZakat({ sheep: 40 })).toBe(1)
    expect(livestockZakat({ sheep: 120 })).toBe(1)
    expect(livestockZakat({ sheep: 121 })).toBe(2)
    expect(livestockZakat({ sheep: 201 })).toBe(3)
    expect(livestockZakat({ sheep: 400 })).toBe(4)
  })

  it('camels: graduated thresholds', () => {
    expect(livestockZakat({ camels: 4 })).toBe(0)
    expect(livestockZakat({ camels: 5 })).toBe(1)
    expect(livestockZakat({ camels: 10 })).toBe(2)
    expect(livestockZakat({ camels: 20 })).toBe(4)
    expect(livestockZakat({ camels: 25 })).toBe(1)
    expect(livestockZakat({ camels: 50 })).toBe(2)
  })

  it('sums heads across species', () => {
    expect(livestockZakat({ cows: 30, sheep: 40, camels: 5 })).toBe(3)
  })
})
