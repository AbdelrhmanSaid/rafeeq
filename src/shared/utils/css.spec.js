import { describe, expect, it } from 'vitest'
import { inkColor, onColor, statusBarMode } from '@/shared/utils/css'

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrastOnWhite = (css) => 1.05 / (luminance(css.match(/\d+/g).map(Number)) + 0.05)

describe('onColor', () => {
  it('puts white on a dark brand fill and near-black on a light one', () => {
    expect(onColor('13, 71, 161')).toBe('#fff')
    expect(onColor('194, 168, 120')).toBe('#1f1b16')
  })
})

describe('inkColor', () => {
  it('darkens a light brand colour until it reads as text on white', () => {
    const sand = inkColor('194, 168, 120')
    expect(sand).not.toBe('rgb(194, 168, 120)')
    expect(contrastOnWhite(sand)).toBeGreaterThanOrEqual(4.5)
  })

  it('leaves a dark brand colour as it is', () => {
    expect(inkColor('27, 94, 32')).toBe('rgb(27, 94, 32)')
  })
})

describe('statusBarMode', () => {
  const android = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 Chrome/154.0.0.0 Mobile Safari/537.36'
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Safari/604.1'

  it("keeps the app's theme when it matches the phone's", () => {
    expect(statusBarMode({ appMode: 'light', systemMode: 'light', userAgent: android })).toBe('light')
    expect(statusBarMode({ appMode: 'dark', systemMode: 'dark', userAgent: android })).toBe('dark')
  })

  it("follows the phone's theme on Android when the two differ, so the icons stay readable", () => {
    expect(statusBarMode({ appMode: 'light', systemMode: 'dark', userAgent: android })).toBe('dark')
    expect(statusBarMode({ appMode: 'dark', systemMode: 'light', userAgent: android })).toBe('light')
  })

  it("keeps the app's theme on iOS, which picks the text colour from the bar", () => {
    expect(statusBarMode({ appMode: 'light', systemMode: 'dark', userAgent: iphone })).toBe('light')
  })

  it("keeps the app's theme when the phone's is unknown", () => {
    expect(statusBarMode({ appMode: 'light', userAgent: android })).toBe('light')
  })
})
