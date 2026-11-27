// In the list, translation stations sit under a "translations" section, so their name is just the language.
// Anywhere without that section, the title spells it out.
export function stationTitle(station) {
  if (!station) return ''
  return station.category === 'translations' ? `ترجمة القرآن ب${station.name}` : station.name
}

// A station's full name on one line, for the page title, share text and lock-screen media info.
export function stationLabel(station) {
  if (!station) return ''
  const title = stationTitle(station)
  return station.description ? `${title} - ${station.description}` : title
}
