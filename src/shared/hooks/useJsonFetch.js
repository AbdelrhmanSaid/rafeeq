import { useCallback, useMemo } from 'react'
import { useAsyncData } from '@/shared/hooks/useAsyncData'

/**
 * Fetches JSON from `url`, refetching whenever it changes. A null url keeps the
 * hook idle, which lets callers wait for a parameter (coordinates, an id, …)
 * before hitting the network.
 */
export function useJsonFetch(url, { enabled = true } = {}) {
  const active = Boolean(url) && enabled

  const fetcher = useCallback(async () => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    return response.json()
  }, [url])

  const { data, error, pending, execute } = useAsyncData(fetcher, { immediate: active, deps: [url, active] })

  return useMemo(
    () => ({ data: active ? data : null, error: active ? error : null, pending: active && pending, execute }),
    [active, data, error, pending, execute],
  )
}
