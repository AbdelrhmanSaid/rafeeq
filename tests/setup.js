import { vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Global browser API mocks
//
// happy-dom covers most of the DOM, but a few APIs used across the app are
// either missing or need to be controllable from tests. We install sensible
// defaults here; individual tests can override them with vi.stubGlobal / spies.
// ---------------------------------------------------------------------------

// matchMedia — used by @vueuse usePreferredDark / useMediaQuery
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

// CSS.supports — used by utilities/css.js. happy-dom's implementation is too
// lenient (it accepts bare hex like "ff0000"), so we install a strict mock
// that mirrors real-browser behaviour for the colour formats the app uses.
const strictSupports = (prop, value) => {
  // The value may be passed as a single "prop: value" string too.
  const candidate = value ?? prop
  if (typeof candidate !== 'string') return false
  return /^(#([0-9a-f]{3}|[0-9a-f]{6})|rgba?\(|color-mix\(|red|blue|green|black|white|transparent)/i.test(
    candidate.trim(),
  )
}
if (typeof globalThis.CSS === 'undefined') {
  globalThis.CSS = {}
}
globalThis.CSS.supports = strictSupports
if (typeof window !== 'undefined') {
  window.CSS = window.CSS || {}
  window.CSS.supports = strictSupports
}

// Notification — referenced at module load by the notifications store.
class NotificationMock {
  constructor(title, options) {
    this.title = title
    this.options = options
    this.close = vi.fn()
  }
}
NotificationMock.permission = 'default'
NotificationMock.requestPermission = vi.fn().mockResolvedValue('granted')
vi.stubGlobal('Notification', NotificationMock)

// scrollTo — referenced by the router afterEach hook
window.scrollTo = window.scrollTo || vi.fn()

// Reset localStorage and any registered mocks before each test so suites
// remain isolated.
beforeEach(() => {
  localStorage.clear()
  NotificationMock.permission = 'default'
})
