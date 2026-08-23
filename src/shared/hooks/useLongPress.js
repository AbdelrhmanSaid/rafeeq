import { useEffect, useRef } from 'react'

/**
 * Fires `handler` when the user presses and holds `ref`'s element. A press that
 * ends early, or drags further than `moveThreshold` pixels, is discarded.
 */
export function useLongPress(ref, handler, { delay = 500, moveThreshold = 10, onRelease } = {}) {
  const handlerRef = useRef(handler)
  const releaseRef = useRef(onRelease)

  // Latest callbacks without re-subscribing the listeners on every render.
  useEffect(() => {
    handlerRef.current = handler
    releaseRef.current = onRelease
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let timer = null
    let origin = null

    const cancel = () => {
      clearTimeout(timer)
      timer = null
      origin = null
    }

    const start = (event) => {
      cancel()
      origin = { x: event.clientX, y: event.clientY }
      timer = setTimeout(() => {
        timer = null
        handlerRef.current?.(event)
      }, delay)
    }

    const move = (event) => {
      if (!origin) return

      const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y)
      if (distance > moveThreshold) cancel()
    }

    const release = (event) => {
      cancel()
      releaseRef.current?.(event)
    }

    element.addEventListener('pointerdown', start)
    element.addEventListener('pointerup', release)
    element.addEventListener('pointercancel', release)
    element.addEventListener('pointerleave', cancel)
    element.addEventListener('pointermove', move)

    return () => {
      cancel()
      element.removeEventListener('pointerdown', start)
      element.removeEventListener('pointerup', release)
      element.removeEventListener('pointercancel', release)
      element.removeEventListener('pointerleave', cancel)
      element.removeEventListener('pointermove', move)
    }
  }, [ref, delay, moveThreshold])
}
