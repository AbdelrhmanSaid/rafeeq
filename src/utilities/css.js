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

// Global font scaling. The whole app sizes in `rem`, so changing the root
// `<html>` font-size proportionally scales every text and rem-based spacing.
// 100 = browser default (≈16px). Bounds keep layouts usable at the extremes.
export const MIN_FONT_SCALE = 80
export const MAX_FONT_SCALE = 130
export const DEFAULT_FONT_SCALE = 100
export const FONT_SCALE_STEP = 5

function ensureMeta(name) {
  let meta = document.querySelector(`meta[name="${name}"]`)

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }

  return meta
}

function normalizeColor(value) {
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

function toRgbValue(color) {
  const probe = document.createElement('div')
  probe.style.color = color
  document.body.appendChild(probe)

  const rgb = getComputedStyle(probe).color
  probe.remove()

  return rgb.match(/\d+/g)?.slice(0, 3).join(', ') ?? null
}

function setVars(vars) {
  const targets = [document.documentElement, document.body]
  for (const el of targets) {
    for (const [name, value] of Object.entries(vars)) {
      el.style.setProperty(name, value)
    }
  }
}

function removeVars(names) {
  const targets = [document.documentElement, document.body]
  for (const el of targets) {
    for (const name of names) {
      el.style.removeProperty(name)
    }
  }
}

export function applyPrimaryColor(color) {
  const fg = normalizeColor(color)

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
  } else {
    removeVars(PRIMARY_COLOR_VARS)
  }
}

export function syncMetaThemeColor() {
  const styles = getComputedStyle(document.body)
  const bg = normalizeColor(styles.backgroundColor || styles.getPropertyValue('--bs-body-bg'))
  if (!bg) return

  ensureMeta('theme-color').setAttribute('content', bg)
  ensureMeta('msapplication-TileColor').setAttribute('content', bg)

  const colorScheme = document.body.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'
  ensureMeta('color-scheme').setAttribute('content', colorScheme)
  document.documentElement.style.colorScheme = colorScheme
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

export function applyMode(mode) {
  document.body.setAttribute('data-bs-theme', mode)
}

export function clampFontScale(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return DEFAULT_FONT_SCALE
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, n))
}

export function applyFontScale(scale) {
  document.documentElement.style.fontSize = `${clampFontScale(scale)}%`
}
