import { describe, it, expect } from 'vitest'
import {
  NISAB,
  goldPriceNisab,
  moneyZakat,
  goldZakat,
  silverZakat,
  cropsZakat,
  businessZakat,
  camelsZakat,
  cowsZakat,
  sheepZakat,
  livestockZakat,
  formatLivestockDue,
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

describe('camels zakat', () => {
  const camels = (n) => formatLivestockDue(camelsZakat(n))

  it.each([
    [4, ''],
    [5, 'شاة'],
    [9, 'شاة'],
    [10, 'شاتان'],
    [15, '3 شياه'],
    [24, '4 شياه'],
    [25, 'بنت مخاض'],
    [35, 'بنت مخاض'],
    [36, 'بنت لبون'],
    [45, 'بنت لبون'],
    [46, 'حقة'],
    [50, 'حقة'],
    [60, 'حقة'],
    [61, 'جذعة'],
    [75, 'جذعة'],
    [76, 'بنتا لبون'],
    [90, 'بنتا لبون'],
    [91, 'حقتان'],
    [100, 'حقتان'],
    [120, 'حقتان'],
    [121, '3 بنات لبون'],
    [130, 'حقة وبنتا لبون'],
    [140, 'حقتان وبنت لبون'],
    [150, '3 حقاق'],
    [160, '4 بنات لبون'],
    [200, '4 حقاق'],
  ])('%i camels: %s', (n, expected) => {
    expect(camels(n)).toBe(expected)
  })
})

describe('cows zakat', () => {
  const cows = (n) => formatLivestockDue(cowsZakat(n))

  it.each([
    [29, ''],
    [30, 'تبيع'],
    [39, 'تبيع'],
    [40, 'مسنة'],
    [59, 'مسنة'],
    [60, 'تبيعان'],
    [70, 'مسنة وتبيع'],
    [80, 'مسنتان'],
    [90, '3 أتبعة'],
    [100, 'مسنة وتبيعان'],
    [120, '3 مسنات'],
  ])('%i cows: %s', (n, expected) => {
    expect(cows(n)).toBe(expected)
  })
})

describe('sheep zakat', () => {
  it.each([
    [39, 0],
    [40, 1],
    [120, 1],
    [121, 2],
    [200, 2],
    [201, 3],
    [399, 3],
    [400, 4],
    [1250, 12],
  ])('%i sheep: %i', (n, count) => {
    expect(sheepZakat(n)).toEqual(count ? [{ kind: 'shah', count }] : [])
  })

  it('names twelve with the singular, as Arabic counts past ten', () => {
    expect(formatLivestockDue(sheepZakat(1250))).toBe('12 شاة')
  })
})

describe('livestockZakat', () => {
  it('keeps each kind of animal apart instead of adding up heads', () => {
    expect(livestockZakat({ cows: 30, sheep: 40, camels: 10 })).toEqual({
      cows: [{ kind: 'tabi', count: 1 }],
      sheep: [{ kind: 'shah', count: 1 }],
      camels: [{ kind: 'shah', count: 2 }],
    })
  })

  it('ignores empty and non-numeric counts', () => {
    expect(livestockZakat({ cows: '', sheep: undefined, camels: 'x' })).toEqual({ cows: [], sheep: [], camels: [] })
  })

  it('writes counts with the given numerals', () => {
    expect(formatLivestockDue([{ kind: 'hiqqa', count: 3 }], (n) => `#${n}`)).toBe('#3 حقاق')
  })
})
