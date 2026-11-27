import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The module keeps its open sheets and its history entry between calls, so each test gets a fresh copy.
async function setup() {
  vi.resetModules()
  const module = await import('@/shared/ui/sheetHistory')
  // What the router knows: the screen's address and state.
  const router = {
    options: {
      history: { location: '/quran/page/3', state: { position: 1, current: '/quran/page/3' }, createHref: (p) => p },
    },
  }
  module.installSheetHistory(router)
  return { ...module, router }
}

// A sheet whose close button does what a real sheet's does: it closes, and stops being tracked.
function open(trackSheet) {
  let untrack = null
  const close = vi.fn(() => untrack())
  untrack = trackSheet(close)
  return { close, untrack }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

describe('sheetHistory', () => {
  // Stands in for the router's own listener, which is added after the module's.
  const routerHeard = vi.fn()

  beforeEach(() => {
    history.replaceState({ position: 1, current: '/quran/page/3' }, '', '/quran/page/3')
    window.addEventListener('popstate', routerHeard)
  })

  afterEach(() => {
    window.removeEventListener('popstate', routerHeard)
    routerHeard.mockReset()
  })

  it('closes the top sheet on back, without the router hearing of it', async () => {
    const { trackSheet } = await setup()
    const { close } = open(trackSheet)

    expect(history.state.bottomSheet).toBeDefined()

    history.back()
    await settle()

    expect(close).toHaveBeenCalledOnce()
    expect(routerHeard).not.toHaveBeenCalled()
    expect(location.pathname).toBe('/quran/page/3')
  })

  it('takes its entry back off when the sheet closes another way', async () => {
    const { trackSheet } = await setup()
    const { untrack } = open(trackSheet)
    expect(history.state.bottomSheet).toBeDefined()

    untrack()
    await settle()

    expect(history.state.bottomSheet).toBeUndefined()
    expect(routerHeard).not.toHaveBeenCalled()
  })

  it('keeps one entry when a sheet hands over to another', async () => {
    const { trackSheet } = await setup()
    open(trackSheet).untrack()
    const { close: closeTafseer } = open(trackSheet)
    await settle()

    expect(history.state.bottomSheet).toBeDefined()

    history.back()
    await settle()

    expect(closeTafseer).toHaveBeenCalledOnce()
  })

  it('puts back the address the router moved to while the sheet was open', async () => {
    const { trackSheet, router } = await setup()
    open(trackSheet)
    // A page turns under the tafsir: the router replaces the sheet's entry.
    history.replaceState({ ...history.state, current: '/quran/page/4' }, '', '/quran/page/4')
    router.options.history.location = '/quran/page/4'
    router.options.history.state = { position: 1, current: '/quran/page/4' }

    history.back()
    await settle()

    expect(location.pathname).toBe('/quran/page/4')
    expect(history.state).toEqual({ position: 1, current: '/quran/page/4' })
  })
})
