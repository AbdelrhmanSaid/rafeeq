// Corrupt or cleared saved coordinates (NaN, 0) count as no location, so the screens ask for one again.
export const isCoordinate = (value) => Number.isFinite(Number(value)) && Number(value) !== 0
