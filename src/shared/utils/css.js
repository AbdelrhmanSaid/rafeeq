const PRIMARY_COLOR_VARS = [
  '--bs-primary',
  '--app-on-primary',
  '--app-primary-ink-light',
  '--bs-primary-rgb',
  '--bs-link-color',
  '--bs-link-hover-color',
  '--bs-primary-text-emphasis',
  '--bs-primary-bg-subtle',
  '--bs-primary-border-subtle',
]

const BG_COLOR_VARS = [
  '--app-body-bg-base',
  '--bs-body-bg',
  '--bs-body-bg-rgb',
  '--bs-secondary-bg',
  '--bs-tertiary-bg',
  '--app-page-bg-color',
  '--app-page-bg-image',
  '--app-page-top-color',
]

// The rem-based UI scales from the root font size; 100 is the browser default.
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

  const channels = rgb.match(/-?\d*\.?\d+/g)?.map(Number)
  if (!channels || channels.length < 3) return null

  const scale = rgb.startsWith('color(') ? 255 : 1

  return channels
    .slice(0, 3)
    .map((n) => Math.round(Math.min(255, Math.max(0, n * scale))))
    .join(', ')
}

const luminance = (channels) => {
  const [r, g, b] = channels.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function onColor(rgb) {
  return luminance(rgb.split(',').map(Number)) > 0.4 ? '#1f1b16' : '#fff'
}

export function inkColor(rgb) {
  const channels = rgb.split(',').map(Number)
  for (let keep = 1; keep > 0; keep -= 0.05) {
    const mixed = channels.map((c) => Math.round(c * keep))
    if (1.05 / (luminance(mixed) + 0.05) >= 4.6) return `rgb(${mixed.join(', ')})`
  }
  return '#000'
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
      '--bs-link-color': 'var(--app-primary-ink)',
      '--bs-link-hover-color': 'color-mix(in srgb, var(--bs-primary) 85%, #000)',
      '--bs-primary-text-emphasis': 'color-mix(in srgb, var(--bs-primary) 85%, #000)',
      '--bs-primary-bg-subtle': 'color-mix(in srgb, var(--bs-primary) 15%, transparent)',
      '--bs-primary-border-subtle': 'color-mix(in srgb, var(--bs-primary) 35%, transparent)',
    }
    const rgb = toRgbValue(fg)
    if (rgb) {
      vars['--bs-primary-rgb'] = rgb
      vars['--app-on-primary'] = onColor(rgb)
      vars['--app-primary-ink-light'] = inkColor(rgb)
    }
    setVars(vars)
  } else {
    removeVars(PRIMARY_COLOR_VARS)
  }
}

// Chrome on Android (154 on Android 15, at least) draws the status-bar icons in the phone's theme, so when the themes
// differ the bar takes the phone's theme to keep its icons readable. iOS picks them from the bar's colour.
export function statusBarMode({ appMode, systemMode, userAgent = navigator.userAgent }) {
  if (!systemMode || systemMode === appMode) return appMode
  return /Android/i.test(userAgent) ? systemMode : appMode
}

function topColorInMode(mode) {
  const probe = document.createElement('div')
  probe.className = 'app-theme-probe'
  probe.setAttribute('data-bs-theme', mode)
  probe.hidden = true
  document.body.appendChild(probe)
  const color = normalizeColor(getComputedStyle(probe).getPropertyValue('--app-page-top-color'))
  probe.remove()
  return color
}

export function syncMetaThemeColor({ systemMode } = {}) {
  const styles = getComputedStyle(document.body)
  const bg = normalizeColor(styles.backgroundColor || styles.getPropertyValue('--bs-body-bg'))
  if (!bg) return

  ensureMeta('msapplication-TileColor').setAttribute('content', bg)

  const colorScheme = document.body.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'

  // index.html's first-paint tags are keyed to the system theme; dropping their media query lets a manual theme win.
  const barMode = statusBarMode({ appMode: colorScheme, systemMode })
  const top =
    barMode === colorScheme ? normalizeColor(styles.getPropertyValue('--app-page-top-color')) : topColorInMode(barMode)
  const rgb = (top && toRgbValue(top)) || toRgbValue(bg)
  if (rgb) {
    ensureMeta('theme-color')
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute('content', `rgb(${rgb})`)
      meta.removeAttribute('media')
    }
  }

  ensureMeta('color-scheme').setAttribute('content', colorScheme)
  document.documentElement.style.colorScheme = colorScheme
}

export function applyBgColor(color) {
  const bg = normalizeColor(color)

  if (bg) {
    // Only embeds set a background, to sit on the host page, so it's used exactly: no brand tint, no glow.
    const vars = {
      '--app-body-bg-base': bg,
      '--bs-body-bg': bg,
      '--bs-secondary-bg': 'color-mix(in srgb, var(--bs-body-bg) 92%, #fff)',
      '--bs-tertiary-bg': 'color-mix(in srgb, var(--bs-body-bg) 84%, #fff)',
      '--app-page-bg-color': bg,
      '--app-page-bg-image': 'none',
      '--app-page-top-color': bg,
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
