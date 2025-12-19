export const getRadioSlug = (radio) => {
  try {
    const url = new URL(radio.url)
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      return segments[segments.length - 1]
    }
  } catch (error) {
    // Fallback to name-based slug
  }

  return radio.name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '')
}

export const findRadioBySlug = (slug, radios) => radios.find((radio) => getRadioSlug(radio) === slug)
