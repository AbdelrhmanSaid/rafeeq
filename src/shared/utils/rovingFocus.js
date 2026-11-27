export function rovingTarget(key, index, count) {
  if (!count) return null
  const steps = { ArrowDown: 1, ArrowLeft: 1, ArrowUp: -1, ArrowRight: -1 }
  if (key in steps) return (index + steps[key] + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}
