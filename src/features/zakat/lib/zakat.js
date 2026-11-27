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

// What's due on livestock is animals, not a share: a sheep or a camel or calf of a given age, named here in Arabic with
// the dual and plural (3–10) forms Arabic counts them with.
export const LIVESTOCK_DUES = {
  shah: { one: 'شاة', two: 'شاتان', few: 'شياه' },
  bintMakhad: { one: 'بنت مخاض', two: 'بنتا مخاض', few: 'بنات مخاض' },
  bintLabun: { one: 'بنت لبون', two: 'بنتا لبون', few: 'بنات لبون' },
  hiqqa: { one: 'حقة', two: 'حقتان', few: 'حقاق' },
  jadhaa: { one: 'جذعة', two: 'جذعتان', few: 'جذاع' },
  tabi: { one: 'تبيع', two: 'تبيعان', few: 'أتبعة' },
  musinna: { one: 'مسنة', two: 'مسنتان', few: 'مسنات' },
}

// The fixed bands of Abu Bakr's letter (Sahih al-Bukhari 1454), up to 120 camels.
const CAMEL_BANDS = [
  [5, 'shah', 1],
  [10, 'shah', 2],
  [15, 'shah', 3],
  [20, 'shah', 4],
  [25, 'bintMakhad', 1],
  [36, 'bintLabun', 1],
  [46, 'hiqqa', 1],
  [61, 'jadhaa', 1],
  [76, 'bintLabun', 2],
  [91, 'hiqqa', 2],
]

const due = (kind, count) => (count > 0 ? [{ kind, count }] : [])

// Past the fixed bands the herd is covered in blocks: one `small` animal per `smallSize` head and one `large` per
// `largeSize`, using as many of the larger blocks as still cover the herd to its last full ten. Where two mixes cover it
// alike (200 camels: four ḥiqqa or five bint labūn), the one with more of the older animal is given.
function coverInBlocks(total, small, smallSize, large, largeSize) {
  const covered = Math.floor(total / 10) * 10

  for (let larges = Math.floor(covered / largeSize); larges >= 0; larges--) {
    const rest = covered - larges * largeSize
    if (rest % smallSize === 0) return [...due(large, larges), ...due(small, rest / smallSize)]
  }

  return []
}

export function camelsZakat(count) {
  const n = toInt(count)
  if (n > 120) return coverInBlocks(n, 'bintLabun', 40, 'hiqqa', 50)

  const band = CAMEL_BANDS.findLast(([from]) => n >= from)
  return band ? due(band[1], band[2]) : []
}

export function cowsZakat(count) {
  const n = toInt(count)
  if (n < NISAB.cows) return []
  if (n < 40) return due('tabi', 1)
  if (n < 60) return due('musinna', 1)
  return coverInBlocks(n, 'tabi', 30, 'musinna', 40)
}

export function sheepZakat(count) {
  const n = toInt(count)
  if (n < NISAB.sheep) return []
  if (n <= 120) return due('shah', 1)
  if (n <= 200) return due('shah', 2)
  if (n < 400) return due('shah', 3)
  return due('shah', Math.floor(n / 100))
}

// What's due for each kind of animal, kept apart: a camel herd and a flock of sheep are judged on their own nisab and
// paid in different animals.
export function livestockZakat({ cows, sheep, camels }) {
  return { camels: camelsZakat(camels), cows: cowsZakat(cows), sheep: sheepZakat(sheep) }
}

// "حقة", "حقتان", "٣ حقاق", "١٢ شاة"; a mix is joined with "و": "حقة وبنتا لبون".
export function formatLivestockDue(dues, numerals = String) {
  return dues
    .map(({ kind, count }) => {
      const names = LIVESTOCK_DUES[kind]
      if (count === 1) return names.one
      if (count === 2) return names.two
      return `${numerals(count)} ${count <= 10 ? names.few : names.one}`
    })
    .join(' و')
}
