// Translation stations are named by language only; outside their list section the title spells it out.
export function stationTitle(station) {
  if (!station) return ''
  return station.category === 'translations' ? `ترجمة القرآن ب${station.name}` : station.name
}

export function stationLabel(station) {
  if (!station) return ''
  const title = stationTitle(station)
  return station.description ? `${title} - ${station.description}` : title
}
