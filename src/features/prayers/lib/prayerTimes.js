import { CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PolarCircleResolution, PrayerTimes } from 'adhan'
import { DEFAULT_METHOD, METHOD_PARAMETERS } from '@/features/prayers/constants/methodParameters'

// Beyond this distance no regional authority is a sensible guess, so fall back to the default method.
const MAX_AUTO_DISTANCE_KM = 2000
const EARTH_RADIUS_KM = 6371

const HIGH_LATITUDE_RULES = {
  1: HighLatitudeRule.MiddleOfTheNight,
  2: HighLatitudeRule.SeventhOfTheNight,
  3: HighLatitudeRule.TwilightAngle,
}

const toRadians = (degrees) => (degrees * Math.PI) / 180

function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

// Pick the closest regional authority, like Aladhan does when no method is given.
export function resolveAutoMethod(latitude, longitude) {
  let closest = { method: DEFAULT_METHOD, distance: MAX_AUTO_DISTANCE_KM }

  for (const [method, { anchors = [] }] of Object.entries(METHOD_PARAMETERS)) {
    for (const [lat, lng] of anchors) {
      const distance = distanceKm(latitude, longitude, lat, lng)
      if (distance < closest.distance) closest = { method, distance }
    }
  }

  return closest.method
}

function getCalculationParameters({ latitude, longitude, method, school, latitudeAdjustment, shafaq } = {}) {
  const methodId = method && METHOD_PARAMETERS[method] ? method : resolveAutoMethod(latitude, longitude)
  const {
    fajr,
    isha = 0,
    ishaInterval = 0,
    maghribAngle = 0,
    maghribOffset = 0,
    moonsighting,
  } = METHOD_PARAMETERS[methodId]

  const params = new CalculationParameters(
    moonsighting ? 'MoonsightingCommittee' : 'Other',
    fajr,
    isha,
    ishaInterval,
    maghribAngle,
  )

  params.methodAdjustments = { ...params.methodAdjustments, maghrib: maghribOffset }
  params.madhab = school === '1' ? Madhab.Hanafi : Madhab.Shafi
  // Aladhan defaults to the angle-based rule.
  params.highLatitudeRule = HIGH_LATITUDE_RULES[latitudeAdjustment] ?? HighLatitudeRule.TwilightAngle
  params.polarCircleResolution = PolarCircleResolution.AqrabYaum
  if (shafaq) params.shafaq = shafaq

  return params
}

const DAY_MS = 24 * 60 * 60 * 1000
// How far towards the equator to look for a latitude where Asr still falls inside the afternoon.
const ASR_SEARCH_STEP = 0.5
const ASR_SEARCH_LIMIT = 48

const startOfLocalDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const isValidTime = (time) => time instanceof Date && !Number.isNaN(time.getTime())

function adhanTimes(lat, lng, date, settings) {
  const params = getCalculationParameters({ latitude: lat, longitude: lng, ...settings })
  return new PrayerTimes(new Coordinates(lat, lng), date, params)
}

// adhan picks the day by the longitude's solar noon, so where the clock is a whole day off (Samoa, Kiritimati) "today"
// would be tomorrow's prayers: shift the day until Dhuhr lands on the requested local date.
function timesForLocalDay(lat, lng, date, settings) {
  const day = startOfLocalDay(date)
  const times = adhanTimes(lat, lng, day, settings)
  if (!isValidTime(times.dhuhr)) return times

  const offset = Math.round((day - startOfLocalDay(times.dhuhr)) / DAY_MS)
  return offset ? adhanTimes(lat, lng, addDays(day, offset), settings) : times
}

const asrIsInOrder = (times) => isValidTime(times.asr) && times.asr > times.dhuhr && times.asr < times.maghrib

// Near the polar circle adhan's Asr can fall outside the afternoon. Like the nearest-city rule, take Asr's share of the
// afternoon from the nearest latitude where it works out (half if none does) and apply it to the local afternoon.
function resolveAsr(lat, lng, date, settings, times) {
  const afternoon = times.maghrib - times.dhuhr
  let share = 0.5

  for (let step = ASR_SEARCH_STEP; step <= ASR_SEARCH_LIMIT; step += ASR_SEARCH_STEP) {
    const nearer = lat - Math.sign(lat) * step
    const reference = timesForLocalDay(nearer, lng, date, settings)
    if (asrIsInOrder(reference)) {
      share = (reference.asr - reference.dhuhr) / (reference.maghrib - reference.dhuhr)
      break
    }
  }

  return new Date(times.dhuhr.getTime() + afternoon * share)
}

// Absolute instants for the local calendar day of `date`, so the device timezone handles daylight saving.
// Always in order (Fajr … Isha): the next-prayer and phase logic relies on it.
export function calculatePrayerTimes({ latitude, longitude, date = new Date(), ...settings }) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  const times = timesForLocalDay(lat, lng, date, settings)
  const hasAfternoon = isValidTime(times.dhuhr) && isValidTime(times.maghrib) && times.maghrib > times.dhuhr
  const asr = hasAfternoon && !asrIsInOrder(times) ? resolveAsr(lat, lng, date, settings, times) : times.asr

  return {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: asr,
    Maghrib: times.maghrib,
    Isha: times.isha,
  }
}
