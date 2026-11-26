import { Coordinates, Qibla } from 'adhan'

export function normalizeAngle(angle) {
  let a = angle
  while (a < 0) a += 360
  while (a >= 360) a -= 360
  return a
}

export function getShortestRotation(from, to) {
  const diff = normalizeAngle(to - from)
  return diff > 180 ? diff - 360 : diff
}

export function smoothAngle(current, target, factor) {
  const delta = getShortestRotation(current, target)
  return normalizeAngle(current + delta * factor)
}

export function needleRotation(qiblaDirection, heading) {
  if (qiblaDirection === null) return 0
  return normalizeAngle(qiblaDirection - heading)
}

export function isFacingQibla(needleAngle, tolerance) {
  return needleAngle <= tolerance || needleAngle >= 360 - tolerance
}

// Bearing to the Kaaba in degrees clockwise from true north.
export function getQiblaDirection(latitude, longitude) {
  return Qibla(new Coordinates(Number(latitude), Number(longitude)))
}

const KAABA = { latitude: 21.4225, longitude: 39.8262 }
const EARTH_RADIUS_KM = 6371

// Great-circle distance from a point to the Kaaba, in kilometres.
export function getDistanceToKaaba(latitude, longitude) {
  const toRadians = (degrees) => (Number(degrees) * Math.PI) / 180
  const dLat = toRadians(KAABA.latitude - latitude)
  const dLon = toRadians(KAABA.longitude - longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(latitude)) * Math.cos(toRadians(KAABA.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

// Ticks for the compass tape: every `step` degrees within `halfRange` of the heading,
// each with its offset from the heading (negative to the left, positive to the right).
export function getTapeTicks(heading, halfRange, step) {
  const ticks = []
  const first = Math.ceil((heading - halfRange) / step) * step
  for (let degree = first; degree <= heading + halfRange; degree += step) {
    ticks.push({ degree: normalizeAngle(degree), offset: degree - heading })
  }
  return ticks
}
