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
