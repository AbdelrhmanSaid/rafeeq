const normalizeColorParam = (value) => {
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

const toRgbValue = (color) => {
  const probe = document.createElement('div')
  probe.style.color = color
  document.body.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  probe.remove()
  return rgb.match(/\d+/g)?.slice(0, 3).join(', ') ?? null
}

const setCssVars = (targets, vars) => {
  targets.forEach((el) => {
    Object.entries(vars).forEach(([name, value]) => {
      el.style.setProperty(name, value)
    })
  })
}

const removeCssVars = (targets, names) => {
  targets.forEach((el) => {
    names.forEach((name) => {
      el.style.removeProperty(name)
    })
  })
}

export const applyQueryTheme = ({ fgParam, bgParam }) => {
  const root = document.documentElement
  const body = document.body
  const targets = [root, body]
  const fg = normalizeColorParam(fgParam)
  const bg = normalizeColorParam(bgParam)

  if (fg) {
    const rgb = toRgbValue(fg)
    const primaryVars = {
      '--bs-primary': fg,
      '--bs-link-color': 'var(--bs-primary)',
      '--bs-link-hover-color': 'color-mix(in srgb, var(--bs-primary) 85%, #000)',
      '--bs-primary-text-emphasis': 'color-mix(in srgb, var(--bs-primary) 85%, #000)',
      '--bs-primary-bg-subtle': 'color-mix(in srgb, var(--bs-primary) 15%, transparent)',
      '--bs-primary-border-subtle': 'color-mix(in srgb, var(--bs-primary) 35%, transparent)',
    }

    if (rgb) primaryVars['--bs-primary-rgb'] = rgb

    setCssVars(targets, primaryVars)
  } else {
    removeCssVars(targets, [
      '--bs-primary',
      '--bs-primary-rgb',
      '--bs-link-color',
      '--bs-link-hover-color',
      '--bs-primary-text-emphasis',
      '--bs-primary-bg-subtle',
      '--bs-primary-border-subtle',
    ])
  }

  if (bg) {
    const rgb = toRgbValue(bg)
    const bgVars = {
      '--bs-body-bg': bg,
      '--bs-secondary-bg': 'color-mix(in srgb, var(--bs-body-bg) 92%, #fff)',
      '--bs-tertiary-bg': 'color-mix(in srgb, var(--bs-body-bg) 84%, #fff)',
    }

    if (rgb) bgVars['--bs-body-bg-rgb'] = rgb

    setCssVars(targets, bgVars)
  } else {
    removeCssVars(targets, [
      '--bs-body-bg',
      '--bs-body-bg-rgb',
      '--bs-secondary-bg',
      '--bs-tertiary-bg',
    ])
  }
}
