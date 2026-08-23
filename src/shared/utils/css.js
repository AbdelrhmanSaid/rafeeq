const PRIMARY_COLOR_VARS = ['--primary', '--primary-foreground', '--ring']

const BG_COLOR_VARS = ['--background', '--card', '--popover', '--secondary', '--muted', '--accent']

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

function toRgb(color) {
  const probe = document.createElement('div')
  probe.style.color = color
  document.body.appendChild(probe)

  const rgb = getComputedStyle(probe).color
  probe.remove()

  return rgb.match(/\d+/g)?.slice(0, 3).map(Number) ?? null
}

function readableForeground(color) {
  const rgb = toRgb(color)
  if (!rgb) return '#fff9f5'

  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.6 ? '#241d17' : '#fff9f5'
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
    setVars({
      '--primary': fg,
      '--primary-foreground': readableForeground(fg),
      '--ring': fg,
    })
  } else {
    removeVars(PRIMARY_COLOR_VARS)
  }
}

export function syncMetaThemeColor() {
  const styles = getComputedStyle(document.body)
  const bg = normalizeColor(styles.backgroundColor || styles.getPropertyValue('--background'))
  if (!bg) return

  ensureMeta('theme-color').setAttribute('content', bg)
  ensureMeta('msapplication-TileColor').setAttribute('content', bg)

  const colorScheme = isDarkMode() ? 'dark' : 'light'
  ensureMeta('color-scheme').setAttribute('content', colorScheme)
  document.documentElement.style.colorScheme = colorScheme
}

export function applyBgColor(color) {
  const bg = normalizeColor(color)

  if (bg) {
    const dark = isDarkMode()

    const cardLift = dark ? 94 : 68
    const popoverLift = dark ? 90 : 76

    const sink = dark ? '#fff' : '#000'

    setVars({
      '--background': bg,
      '--card': `color-mix(in srgb, ${bg} ${cardLift}%, #fff)`,
      '--popover': `color-mix(in srgb, ${bg} ${popoverLift}%, #fff)`,
      '--secondary': `color-mix(in srgb, ${bg} 94%, ${sink})`,
      '--muted': `color-mix(in srgb, ${bg} 94%, ${sink})`,
      '--accent': `color-mix(in srgb, ${bg} 88%, ${sink})`,
    })
  } else {
    removeVars(BG_COLOR_VARS)
  }
}

export function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

export function applyMode(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.setAttribute('data-theme', mode)
}

export function clampFontScale(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return DEFAULT_FONT_SCALE
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, n))
}

export function applyFontScale(scale) {
  document.documentElement.style.fontSize = `${clampFontScale(scale)}%`
}
