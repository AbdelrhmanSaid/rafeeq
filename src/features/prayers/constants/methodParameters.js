// Calculation parameters keyed by the Aladhan method ids users already have stored, mirroring
// https://api.aladhan.com/v1/methods so a saved method keeps producing the same times.
// `ishaInterval` and `maghribOffset` are minutes after sunset; `anchors` are the [lat, lng] points
// of the authority's region that the automatic method picks from.
export const DEFAULT_METHOD = '3'

export const METHOD_PARAMETERS = {
  // Shia Ithna-Ashari, Qum
  0: { fajr: 16, isha: 14, maghribAngle: 4 },
  // University of Islamic Sciences, Karachi
  1: { fajr: 18, isha: 18, anchors: [[24.8607, 67.0011]] },
  // Islamic Society of North America
  2: {
    fajr: 15,
    isha: 15,
    anchors: [
      [39.7042, -86.3994],
      [34.0522, -118.2437],
    ],
  },
  // Muslim World League
  3: { fajr: 18, isha: 17 },
  // Umm Al-Qura University, Makkah
  4: {
    fajr: 18.5,
    ishaInterval: 90,
    anchors: [
      [21.3891, 39.8579],
      [24.7136, 46.6753],
    ],
  },
  // Egyptian General Authority of Survey
  5: { fajr: 19.5, isha: 17.5, anchors: [[30.0444, 31.2357]] },
  // Institute of Geophysics, University of Tehran
  7: { fajr: 17.7, isha: 14, maghribAngle: 4.5, anchors: [[35.6892, 51.389]] },
  // Gulf Region
  8: { fajr: 19.5, ishaInterval: 90 },
  // Kuwait
  9: { fajr: 18, isha: 17.5, anchors: [[29.3759, 47.9774]] },
  // Qatar
  10: { fajr: 18, ishaInterval: 90, anchors: [[25.2854, 51.531]] },
  // Majlis Ugama Islam Singapura
  11: { fajr: 20, isha: 18, anchors: [[1.3521, 103.8198]] },
  // Union Organization Islamic de France
  12: { fajr: 12, isha: 12, anchors: [[48.8566, 2.3522]] },
  // Diyanet İşleri Başkanlığı, Turkey
  13: { fajr: 18, isha: 17, anchors: [[39.9334, 32.8597]] },
  // Spiritual Administration of Muslims of Russia
  14: { fajr: 16, isha: 15, anchors: [[55.7558, 37.6173]] },
  // Moonsighting Committee Worldwide, uses adhan's seasonal twilight model
  15: { fajr: 18, isha: 18, moonsighting: true },
  // Dubai
  16: { fajr: 18.2, isha: 18.2, anchors: [[25.2048, 55.2708]] },
  // Jabatan Kemajuan Islam Malaysia
  17: { fajr: 20, isha: 18, anchors: [[3.139, 101.6869]] },
  // Tunisia
  18: { fajr: 18, isha: 18, anchors: [[36.8065, 10.1815]] },
  // Algeria
  19: { fajr: 18, isha: 17, anchors: [[36.7538, 3.0588]] },
  // Kementerian Agama Republik Indonesia
  20: { fajr: 20, isha: 18, anchors: [[-6.2088, 106.8456]] },
  // Morocco
  21: { fajr: 19, isha: 17, anchors: [[33.9716, -6.8498]] },
  // Comunidade Islamica de Lisboa
  22: { fajr: 18, ishaInterval: 80, maghribOffset: 3, anchors: [[38.7223, -9.1393]] },
  // Ministry of Awqaf, Jordan
  23: { fajr: 18, isha: 18, maghribOffset: 5, anchors: [[31.9454, 35.9284]] },
}
