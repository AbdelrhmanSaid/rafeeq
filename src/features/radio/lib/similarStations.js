// The same reciter's other recitations first, then the nearest stations in the same section.
export function getSimilarStations(slug, radios, limit = 4) {
  const entries = Object.entries(radios).map(([key, station]) => ({ slug: key, ...station }))
  const current = entries.find((station) => station.slug === slug)
  if (!current) return []

  const sameName = entries.filter((station) => station.slug !== slug && station.name === current.name)

  const section = entries.filter((station) => station.category === current.category)
  const index = section.findIndex((station) => station.slug === slug)
  const neighbours = section
    .map((station, position) => ({ station, distance: Math.abs(position - index) }))
    .filter(({ station }) => station.slug !== slug && station.name !== current.name)
    .sort((a, b) => a.distance - b.distance)
    .map(({ station }) => station)

  return [...sameName, ...neighbours].slice(0, limit)
}
