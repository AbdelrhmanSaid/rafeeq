const RAD = Math.PI / 180

const sin = (degrees) => Math.sin(degrees * RAD)
const cos = (degrees) => Math.cos(degrees * RAD)

// Meeus, Astronomical Algorithms ch. 25; good to a few hundredths of a degree.
export function getSunPosition(date, latitude, longitude) {
  const days = date.getTime() / 86400000 + 2440587.5 - 2451545
  const t = days / 36525

  const meanLongitude = 280.46646 + t * (36000.76983 + t * 0.0003032)
  const anomaly = 357.52911 + t * (35999.05029 - t * 0.0001537)
  const centre =
    sin(anomaly) * (1.914602 - t * (0.004817 + t * 0.000014)) +
    sin(2 * anomaly) * (0.019993 - t * 0.000101) +
    sin(3 * anomaly) * 0.000289
  const node = 125.04 - 1934.136 * t
  const nutation = -0.00478 * sin(node)
  const longitudeOnEcliptic = meanLongitude + centre - 0.00569 + nutation
  const obliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60 + 0.00256 * cos(node)

  const declination = Math.asin(sin(obliquity) * sin(longitudeOnEcliptic)) / RAD
  const rightAscension = Math.atan2(cos(obliquity) * sin(longitudeOnEcliptic), cos(longitudeOnEcliptic)) / RAD

  const siderealTime = 280.46061837 + 360.98564736629 * days + t * t * 0.000387933 + nutation * cos(obliquity)
  const hourAngle = siderealTime + Number(longitude) - rightAscension

  const east = -cos(declination) * sin(hourAngle)
  const north = sin(declination) * cos(latitude) - cos(declination) * sin(latitude) * cos(hourAngle)
  const up = sin(declination) * sin(latitude) + cos(declination) * cos(latitude) * cos(hourAngle)

  return {
    azimuth: (((Math.atan2(east, north) / RAD) % 360) + 360) % 360,
    altitude: Math.asin(Math.min(1, Math.max(-1, up))) / RAD,
  }
}
