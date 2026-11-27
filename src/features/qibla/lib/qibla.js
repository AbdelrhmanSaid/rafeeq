import geodesic from 'geographiclib-geodesic'
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

const KAABA = { latitude: 21.4225241, longitude: 39.8261818 }
const RAD = Math.PI / 180

// On the WGS84 ellipsoid GPS positions are given on; a sphere puts the bearing up to 0.2° off.
function toKaaba(latitude, longitude) {
  return geodesic.Geodesic.WGS84.Inverse(Number(latitude), Number(longitude), KAABA.latitude, KAABA.longitude)
}

export function getQiblaDirection(latitude, longitude) {
  const bearing = toKaaba(latitude, longitude).azi1
  return Number.isFinite(bearing) ? normalizeAngle(bearing) : Number.NaN
}

export function getDistanceToKaaba(latitude, longitude) {
  return toKaaba(latitude, longitude).s12 / 1000
}

export function getBearingUncertainty(accuracy, distance) {
  if (!Number.isFinite(accuracy) || !Number.isFinite(distance) || accuracy < 0) return null
  return Math.atan2(accuracy / 1000, distance) / RAD
}

export function getTapeTicks(heading, halfRange, step) {
  const ticks = []
  const first = Math.ceil((heading - halfRange) / step) * step
  for (let degree = first; degree <= heading + halfRange; degree += step) {
    ticks.push({ degree: normalizeAngle(degree), offset: degree - heading })
  }
  return ticks
}

// Unlike `360 - alpha` this holds when tilted and for the equivalent (alpha + 180, 180 - beta, gamma ± 180) pose
// some browsers report; undefined only on the phone's side, which `isHeldSideways` catches.
export function headingFromOrientation(alpha, beta, gamma) {
  const sa = Math.sin(alpha * RAD)
  const ca = Math.cos(alpha * RAD)
  const sb = Math.sin(beta * RAD)
  const sg = Math.sin(gamma * RAD)
  const cg = Math.cos(gamma * RAD)

  const east = -(sa * cg + ca * sb * sg)
  const north = ca * cg - sa * sb * sg

  return normalizeAngle(Math.atan2(east, north) / RAD)
}

export function isHeldSideways(beta, gamma) {
  return Math.abs(Math.cos(beta * RAD) * Math.sin(gamma * RAD)) > 0.75
}

export function tiltFromFlat(beta, gamma) {
  const cosine = Math.cos(beta * RAD) * Math.cos(gamma * RAD)
  return Math.acos(Math.min(1, Math.max(-1, cosine))) / RAD
}

// The gyroscope can't feel magnets, so the compass-minus-gyro gap holds still unless something disturbs the compass.
export function createDriftMonitor({ windowMs = 10000, everyMs = 200 } = {}) {
  let samples = []
  let spread = 0

  return {
    add(offset, time) {
      if (samples.length && time - samples[samples.length - 1].time < everyMs) return spread
      samples.push({ offset, time })
      samples = samples.filter((sample) => time - sample.time <= windowMs)
      spread = Math.max(...samples.map((sample) => Math.abs(getShortestRotation(sample.offset, offset))))
      return spread
    },
    reset() {
      samples = []
      spread = 0
    },
  }
}

// Add to a magnetic heading for a true one. WMM 2025 runs to late 2029 and extrapolates after.
export function getDeclination(latitude, longitude, date = new Date()) {
  try {
    const declination = geomagnetism
      .model(date, { allowOutOfBoundsModel: true })
      .point([Number(latitude), Number(longitude)]).decl
    return Number.isFinite(declination) ? declination : null
  } catch {
    return null
  }
}
