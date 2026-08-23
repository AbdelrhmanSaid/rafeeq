import { useEffect, useRef, useState } from 'react'

// Re-runs `execute` when the connection comes back, and reports that a recovery
// fetch is in flight so callers can keep showing a loading state.
export function useReconnectExecute(execute) {
  const [isRecoveringOnReconnect, setIsRecovering] = useState(false)

  const executeRef = useRef(execute)
  useEffect(() => {
    executeRef.current = execute
  })

  useEffect(() => {
    let cancelled = false

    const onReconnect = () => {
      setIsRecovering(true)
      Promise.resolve(executeRef.current()).finally(() => {
        if (!cancelled) setIsRecovering(false)
      })
    }

    window.addEventListener('online', onReconnect)

    return () => {
      cancelled = true
      window.removeEventListener('online', onReconnect)
    }
  }, [])

  return { isRecoveringOnReconnect }
}
