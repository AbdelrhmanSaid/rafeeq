import { defineStore } from 'pinia'
import { computed, watchEffect } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

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

function applyPrimaryColor(color) {
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

function applyBgColor(color) {
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

export const useThemeStore = defineStore('theme', () => {
  const mode = useLocalStorage('mode', 'system')
  const primaryColor = useLocalStorage('theme-primary', '')
  const prefersDark = usePreferredDark()

  const resolvedMode = computed(() => {
    if (mode.value === 'system') return prefersDark.value ? 'dark' : 'light'
    return mode.value
  })

  const isDark = computed(() => resolvedMode.value === 'dark')

  function setMode(next) {
    if (['light', 'dark', 'system'].includes(next)) {
      mode.value = next
    }
  }

  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  function setPrimaryColor(color) {
    primaryColor.value = color || ''
  }

  function applyQueryOverrides({ mode: modeParam, fg, bg }) {
    if (modeParam === 'light' || modeParam === 'dark') setMode(modeParam)
    if (fg) applyPrimaryColor(fg)
    if (bg) applyBgColor(bg)
  }

  watchEffect(() => {
    document.body.setAttribute('data-bs-theme', resolvedMode.value)
  })

  watchEffect(() => {
    applyPrimaryColor(primaryColor.value || null)
  })

  return {
    mode,
    primaryColor,
    isDark,
    setMode,
    toggle,
    setPrimaryColor,
    applyQueryOverrides,
  }
})
