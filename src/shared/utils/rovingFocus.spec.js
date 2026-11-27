import { describe, expect, it } from 'vitest'
import { rovingTarget } from './rovingFocus'

describe('rovingTarget', () => {
  it('moves along the list with the arrows, left being onward on a right-to-left page', () => {
    expect(rovingTarget('ArrowDown', 0, 3)).toBe(1)
    expect(rovingTarget('ArrowLeft', 0, 3)).toBe(1)
    expect(rovingTarget('ArrowUp', 2, 3)).toBe(1)
    expect(rovingTarget('ArrowRight', 2, 3)).toBe(1)
  })

  it('wraps round at the ends, and jumps to them with Home and End', () => {
    expect(rovingTarget('ArrowDown', 2, 3)).toBe(0)
    expect(rovingTarget('ArrowUp', 0, 3)).toBe(2)
    expect(rovingTarget('Home', 2, 3)).toBe(0)
    expect(rovingTarget('End', 0, 3)).toBe(2)
  })

  it('leaves other keys, and an empty list, alone', () => {
    expect(rovingTarget('Tab', 0, 3)).toBe(null)
    expect(rovingTarget('ArrowDown', 0, 0)).toBe(null)
  })
})
