// A radio list (an options sheet) is one Tab stop, and the keys move between its options: the arrows along it, wrapping
// round (left is onward on a right-to-left page), and Home and End to its ends. Null for any other key.
export function rovingTarget(key, index, count) {
  if (!count) return null
  const steps = { ArrowDown: 1, ArrowLeft: 1, ArrowUp: -1, ArrowRight: -1 }
  if (key in steps) return (index + steps[key] + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}
