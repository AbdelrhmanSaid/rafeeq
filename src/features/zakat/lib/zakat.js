export const NISAB = {
  money: 2156.25, // EGP fallback
  gold: 85, // g
  silver: 595, // g
  cows: 30,
  sheep: 40,
  camels: 5,
  crops: 653, // kg (5 wasq)
  business: 2156.25,
}

export const ZAKAT_RATE = 0.025
export const CROPS_RATE = 0.05 // Rain-fed crops use 10%.

const toNumber = (value) => parseFloat(value) || 0
const toInt = (value) => parseInt(value) || 0

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
