// Clamped so the percent never contradicts the count: anything started is at least 1%, anything unfinished at most 99%.
export function progressPercent(done, total) {
  if (total <= 0 || done <= 0) return 0
  if (done >= total) return 100
  return Math.min(99, Math.max(1, Math.round((done / total) * 100)))
}
