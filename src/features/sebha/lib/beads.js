// The ring draws a misbaha's 33 beads. Counting is open-ended: the beads only cycle as a rhythm, with no target.
export const BEADS = 33

// Beads lit on the ring: none before the first tap, then one more per tap, starting over after the last bead.
export function litBeads(count) {
  if (count <= 0) return 0
  return ((count - 1) % BEADS) + 1
}

// The beads' centres on a ring, starting at the top and running counter-clockwise so they fill right-to-left.
export function beadPositions(center, radius) {
  return Array.from({ length: BEADS }, (_, index) => {
    const angle = -Math.PI / 2 - (index * 2 * Math.PI) / BEADS
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }
  })
}
