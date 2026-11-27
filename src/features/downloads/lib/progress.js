// The share downloaded, as a whole percentage. Rounding alone showed "٠٪" beside "١ من ٢٤٨" and could show "١٠٠٪"
// with one left, so anything started reads at least 1% and anything unfinished at most 99%.
export function progressPercent(done, total) {
  if (total <= 0 || done <= 0) return 0
  if (done >= total) return 100
  return Math.min(99, Math.max(1, Math.round((done / total) * 100)))
}
