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

export function getCalculationParameters({ latitude, longitude, method, school, latitudeAdjustment, shafaq } = {}) {
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

// Times are computed for the local calendar day of `date` and returned as absolute instants,
// so formatting them in the device timezone handles daylight saving automatically.
export function calculatePrayerTimes({ latitude, longitude, date = new Date(), ...settings }) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  const params = getCalculationParameters({ latitude: lat, longitude: lng, ...settings })
  const times = new PrayerTimes(new Coordinates(lat, lng), date, params)

  return {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: times.asr,
    Maghrib: times.maghrib,
    Isha: times.isha,
  }
}
