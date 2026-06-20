// Minimum thresholds (nisab) at which each kind of wealth becomes zakatable.
export const NISAB = {
  money: 2156.25, // ~85g of gold in EGP (fallback when no live gold price)
  gold: 85, // grams
  silver: 595, // grams
  cows: 30,
  sheep: 40,
  camels: 5,
  crops: 653, // kg (5 wasq)
  business: 2156.25,
}

export const ZAKAT_RATE = 0.025 // 2.5% on money, gold, silver, business
export const CROPS_RATE = 0.05 // 5% baseline for crops (10% rain-fed)

const toNumber = (value) => parseFloat(value) || 0
const toInt = (value) => parseInt(value) || 0

// Nisab derived from a live gold price, falling back to a fixed value.
export function goldPriceNisab(goldPrice, fallback) {
  const price = parseFloat(goldPrice)
  return price && price > 0 ? price * NISAB.gold : fallback
}

export function moneyZakat(amount, nisab) {
  const value = toNumber(amount)
  return value < nisab ? 0 : value * ZAKAT_RATE
}

export function goldZakat(weight) {
  const value = toNumber(weight)
  return value < NISAB.gold ? 0 : value * ZAKAT_RATE
}

export function silverZakat(weight) {
  const value = toNumber(weight)
  return value < NISAB.silver ? 0 : value * ZAKAT_RATE
}

export function cropsZakat(amount) {
  const value = toNumber(amount)
  return value < NISAB.crops ? 0 : value * CROPS_RATE
}

export function businessZakat(amount, nisab) {
  const value = toNumber(amount)
  return value < nisab ? 0 : value * ZAKAT_RATE
}

// Livestock zakat is paid in heads, per the graduated shariah thresholds.
export function livestockZakat({ cows, sheep, camels }) {
  const c = toInt(cows)
  const s = toInt(sheep)
  const m = toInt(camels)
  let heads = 0

  if (c >= NISAB.cows) heads += Math.floor(c / 30)

  if (s >= NISAB.sheep) {
    if (s <= 120) heads += 1
    else if (s <= 200) heads += 2
    else if (s <= 399) heads += 3
    else heads += Math.floor(s / 100)
  }

  if (m >= NISAB.camels) {
    if (m <= 9) heads += 1
    else if (m <= 14) heads += 2
    else if (m <= 19) heads += 3
    else if (m <= 24) heads += 4
    else heads += Math.floor(m / 25)
  }

  return heads
}
