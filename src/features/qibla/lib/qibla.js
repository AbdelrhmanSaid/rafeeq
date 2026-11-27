import { Coordinates, Qibla } from 'adhan'
import geomagnetism from 'geomagnetism'

// Into [0, 360). Anything that isn't a finite number reads as north instead of poisoning later maths.
export function normalizeAngle(angle) {
  if (!Number.isFinite(angle)) return 0
  return ((angle % 360) + 360) % 360
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

const RAD = Math.PI / 180

// Compass heading (degrees clockwise from north) of where the phone points, from a deviceorientation(absolute)
// event's Euler angles. `360 - alpha` is only right while the phone lies flat: tilted up it drifts, and browsers may
// report the same pose as (alpha + 180, 180 - beta, gamma ± 180), which flipped the heading by 180°.
// "Where the phone points" is the horizontal direction at right angles to its left-right edge: the top edge when it
// lies flat, the back (camera) when it's held up, and a smooth blend in between, with no jump at any tilt.
// It's the same for both Euler forms. It's undefined only when the left-right edge itself points straight up
// (the phone held on its side), which `isHeldSideways` catches.
export function headingFromOrientation(alpha, beta, gamma) {
  const sa = Math.sin(alpha * RAD)
  const ca = Math.cos(alpha * RAD)
  const sb = Math.sin(beta * RAD)
  const sg = Math.sin(gamma * RAD)
  const cg = Math.cos(gamma * RAD)

  // The phone's left-right axis in the earth frame (east, north), turned a quarter left: the way it faces.
  const east = -(sa * cg + ca * sb * sg)
  const north = ca * cg - sa * sb * sg

  return normalizeAngle(Math.atan2(east, north) / RAD)
}

// True when the phone's left-right edge points mostly up or down: held on its side, as in landscape. The heading
// can't be read reliably then, and a rotation-locked screen would still report portrait.
export function isHeldSideways(beta, gamma) {
  return Math.abs(Math.cos(beta * RAD) * Math.sin(gamma * RAD)) > 0.75
}

// Phone compasses measure from magnetic north; the qibla bearing is from true north. The gap (magnetic declination)
// depends on place and year: about +5° in Cairo, -12° in New York. Add it to turn a magnetic heading into a true one.
// The bundled World Magnetic Model 2025 runs to late 2029; past that it extrapolates (still within a degree or so for
// a few years) rather than failing, and anything unexpected falls back to no correction.
export function getDeclination(latitude, longitude, date = new Date()) {
  try {
    const declination = geomagnetism
      .model(date, { allowOutOfBoundsModel: true })
      .point([Number(latitude), Number(longitude)]).decl
    return Number.isFinite(declination) ? declination : 0
  } catch {
    return 0
  }
}
