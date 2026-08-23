import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async fetcher and tracks its lifecycle. Pairs with <AsyncContent>.
 * The fetcher re-runs whenever `deps` change; only the newest run may settle
 * the state, so overlapping requests can't resolve out of order.
 */
export function useAsyncData(fetcher, { immediate = true, deps = [] } = {}) {
  const [state, setState] = useState({ data: null, error: null, pending: immediate })

  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const requestId = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const execute = useCallback(async () => {
    const id = ++requestId.current
    setState((current) => ({ ...current, pending: true, error: null }))

    try {
      const data = await fetcherRef.current()
      if (mounted.current && id === requestId.current) setState({ data, error: null, pending: false })
    } catch (error) {
      if (mounted.current && id === requestId.current) setState({ data: null, error, pending: false })
    }
  }, [])

  useEffect(() => {
    if (immediate) execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, ...deps])

  return { ...state, execute }
}
