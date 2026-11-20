import { afterEach, describe, expect, it } from 'vitest'
import { measureKeyboard, resetKeyboard, useVirtualKeyboard } from './useVirtualKeyboard'

const viewport = (height, width = 390, scale = 1) => ({ height, width, scale })

describe('useVirtualKeyboard', () => {
  afterEach(resetKeyboard)

  it('is closed while the viewport stays at its tallest', () => {
    const { open } = useVirtualKeyboard()
    measureKeyboard(viewport(800))
    expect(open.value).toBe(false)
  })

  it('opens when the viewport shrinks past the threshold', () => {
    const { open } = useVirtualKeyboard()
    measureKeyboard(viewport(800))
    measureKeyboard(viewport(450))
    expect(open.value).toBe(true)

    measureKeyboard(viewport(800))
    expect(open.value).toBe(false)
  })

  it('ignores the URL bar collapsing', () => {
    const { open } = useVirtualKeyboard()
    measureKeyboard(viewport(740))
    measureKeyboard(viewport(800))
    measureKeyboard(viewport(740))
    expect(open.value).toBe(false)
  })

  it('starts over when the phone rotates', () => {
    const { open } = useVirtualKeyboard()
    measureKeyboard(viewport(800, 390))
    measureKeyboard(viewport(360, 844))
    expect(open.value).toBe(false)
  })
})
