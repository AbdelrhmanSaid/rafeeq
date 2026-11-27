import { describe, expect, it } from 'vitest'
import { BEADS, beadPositions, litBeads } from './beads'

describe('litBeads', () => {
  it('lights nothing before the first tap', () => {
    expect(litBeads(0)).toBe(0)
  })

  it('lights one more bead per tap and starts over after the last one', () => {
    expect(litBeads(1)).toBe(1)
    expect(litBeads(33)).toBe(33)
    expect(litBeads(34)).toBe(1)
    expect(litBeads(250)).toBe(19)
  })
})

describe('beadPositions', () => {
  it('places the beads on the ring, starting at the top', () => {
    const beads = beadPositions(100, 80)

    expect(beads).toHaveLength(BEADS)
    expect(beads[0].x).toBeCloseTo(100)
    expect(beads[0].y).toBeCloseTo(20)
  })
})
