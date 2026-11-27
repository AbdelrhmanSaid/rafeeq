// Counting is open-ended; the 33 beads only cycle as a rhythm.
export const BEADS = 33

export function litBeads(count) {
  if (count <= 0) return 0
  return ((count - 1) % BEADS) + 1
}

// Starts at the top and runs counter-clockwise so the beads fill right-to-left.
export function beadPositions(center, radius) {
  return Array.from({ length: BEADS }, (_, index) => {
    const angle = -Math.PI / 2 - (index * 2 * Math.PI) / BEADS
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }
  })
}
