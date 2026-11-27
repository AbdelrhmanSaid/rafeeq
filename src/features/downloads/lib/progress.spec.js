import { describe, expect, it } from 'vitest'
import { progressPercent } from './progress'

describe('progressPercent', () => {
  it('is 0 with nothing downloaded or nothing to download', () => {
    expect(progressPercent(0, 248)).toBe(0)
    expect(progressPercent(0, 0)).toBe(0)
  })

  it('is never 0 once something is downloaded', () => {
    expect(progressPercent(1, 248)).toBe(1)
  })

  it('is never 100 until everything is downloaded', () => {
    expect(progressPercent(247, 248)).toBe(99)
    expect(progressPercent(248, 248)).toBe(100)
  })

  it('rounds in between', () => {
    expect(progressPercent(124, 248)).toBe(50)
  })
})
