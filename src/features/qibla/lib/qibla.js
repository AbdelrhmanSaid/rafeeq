// Wraps any angle into the [0, 360) range.
export function normalizeAngle(angle) {
  let a = angle
  while (a < 0) a += 360
  while (a >= 360) a -= 360
  return a
}

// Signed shortest rotation (-180, 180] from one heading to another.
export function getShortestRotation(from, to) {
  const diff = normalizeAngle(to - from)
  return diff > 180 ? diff - 360 : diff
}

// Exponential moving average toward `target`, handling 0/360 wraparound.
export function smoothAngle(current, target, factor) {
  const delta = getShortestRotation(current, target)
  return normalizeAngle(current + delta * factor)
}

// Rotation for the qibla needle given the qibla bearing and device heading.
export function needleRotation(qiblaDirection, heading) {
  if (qiblaDirection === null) return 0
  return normalizeAngle(qiblaDirection - heading)
}

// Whether the needle points up (toward the qibla) within `tolerance` degrees.
export function isFacingQibla(needleAngle, tolerance) {
  return needleAngle <= tolerance || needleAngle >= 360 - tolerance
}
