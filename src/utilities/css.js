const PRIMARY_COLOR_VARS = [
  '--bs-primary',
  '--bs-primary-rgb',
  '--bs-link-color',
  '--bs-link-hover-color',
  '--bs-primary-text-emphasis',
  '--bs-primary-bg-subtle',
  '--bs-primary-border-subtle',
]

const BG_COLOR_VARS = ['--bs-body-bg', '--bs-body-bg-rgb', '--bs-secondary-bg', '--bs-tertiary-bg']

export function normalizeColor(value) {
  if (!value) return null

  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || typeof raw !== 'string') return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  if (CSS.supports('color', trimmed)) return trimmed

  const withHash = `#${trimmed.replace(/^#/, '')}`
  if (CSS.supports('color', withHash)) return withHash

  return null
}

export function toRgbValue(color) {
  const probe = document.createElement('div')
  probe.style.color = color
  document.body.appendChild(probe)

  const rgb = getComputedStyle(probe).color
  probe.remove()

  return rgb.match(/\d+/g)?.slice(0, 3).join(', ') ?? null
}

export function setVars(vars) {
  const targets = [document.documentElement, document.body]
  for (const el of targets) {
    for (const [name, value] of Object.entries(vars)) {
      el.style.setProperty(name, value)
    }
  }
}

export function removeVars(names) {
  const targets = [document.documentElement, document.body]
  for (const el of targets) {
    for (const name of names) {
      el.style.removeProperty(name)
    }
  }
}

export function applyPrimaryColor(color) {
  const fg = normalizeColor(color)

  let themeColorMeta = document.querySelector('meta[name="theme-color"]')

  if (fg) {
    const vars = {
      '--bs-primary': fg,
      '--bs-link-color': 'var(--bs-primary)',
      '--bs-link-hover-color': 'color-mix(in srgb, var(--bs-primary) 85%, #000)',
      '--bs-primary-text-emphasis': 'color-mix(in srgb, var(--bs-primary) 85%, #000)',
      '--bs-primary-bg-subtle': 'color-mix(in srgb, var(--bs-primary) 15%, transparent)',
      '--bs-primary-border-subtle': 'color-mix(in srgb, var(--bs-primary) 35%, transparent)',
    }
    const rgb = toRgbValue(fg)
    if (rgb) vars['--bs-primary-rgb'] = rgb
    setVars(vars)

    // Update the theme color meta tag
    themeColorMeta?.setAttribute('content', fg)
  } else {
    removeVars(PRIMARY_COLOR_VARS)

    // Remove the theme color meta tag
    let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--bs-primary')
    themeColorMeta?.setAttribute('content', normalizeColor(primaryColor))
  }
}

export function applyBgColor(color) {
  const bg = normalizeColor(color)

  if (bg) {
    const vars = {
      '--bs-body-bg': bg,
      '--bs-secondary-bg': 'color-mix(in srgb, var(--bs-body-bg) 92%, #fff)',
      '--bs-tertiary-bg': 'color-mix(in srgb, var(--bs-body-bg) 84%, #fff)',
    }
    const rgb = toRgbValue(bg)
    if (rgb) vars['--bs-body-bg-rgb'] = rgb
    setVars(vars)
  } else {
    removeVars(BG_COLOR_VARS)
  }
}
