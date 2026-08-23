import { useEffect, useState } from 'react'

/**
 * Keeps a component mounted while it animates out. Returns whether to render
 * it, plus whether it should be in its visible state, so CSS can transition
 * between the two.
 *
 * @returns {{ isMounted: boolean, isVisible: boolean }}
 */
export function usePresence(show, duration = 300) {
  const [phase, setPhase] = useState(show ? 'visible' : 'hidden')

  useEffect(() => {
    if (show) {
      // Mount in the hidden state first, then flip on the next frame so the
      // browser has an "enter from" style to transition away from.
      const frame = requestAnimationFrame(() => setPhase('visible'))
      return () => cancelAnimationFrame(frame)
    }

    const timer = setTimeout(() => setPhase('hidden'), duration)
    return () => clearTimeout(timer)
  }, [show, duration])

  return {
    isMounted: show || phase !== 'hidden',
    isVisible: show && phase === 'visible',
  }
}
