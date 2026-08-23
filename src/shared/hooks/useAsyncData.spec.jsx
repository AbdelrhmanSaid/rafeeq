import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAsyncData } from './useAsyncData'

describe('useAsyncData', () => {
  it('resolves data and clears pending', async () => {
    const { result } = renderHook(() => useAsyncData(async () => ({ ok: 1 })))

    expect(result.current.pending).toBe(true)

    await waitFor(() => expect(result.current.pending).toBe(false))

    expect(result.current.data).toEqual({ ok: 1 })
    expect(result.current.error).toBe(null)
  })

  it('captures a rejected fetch as error', async () => {
    const { result } = renderHook(() => useAsyncData(() => Promise.reject(new Error('boom'))))

    await waitFor(() => expect(result.current.pending).toBe(false))

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.data).toBe(null)
  })

  it('does not fetch immediately when immediate is false', () => {
    const fetcher = vi.fn()

    const { result } = renderHook(() => useAsyncData(fetcher, { immediate: false }))

    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.pending).toBe(false)
  })

  it('re-runs the fetcher when a dependency changes', async () => {
    const fetcher = vi.fn(async (id) => ({ id }))

    const { result, rerender } = renderHook(({ id }) => useAsyncData(() => fetcher(id), { deps: [id] }), {
      initialProps: { id: 1 },
    })

    await waitFor(() => expect(result.current.data).toEqual({ id: 1 }))

    rerender({ id: 2 })

    await waitFor(() => expect(result.current.data).toEqual({ id: 2 }))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('ignores a stale request that settles after a newer one', async () => {
    const resolvers = []
    const fetcher = () => new Promise((resolve) => resolvers.push(resolve))

    const { result } = renderHook(() => useAsyncData(fetcher))

    await waitFor(() => expect(resolvers).toHaveLength(1))
    result.current.execute()
    await waitFor(() => expect(resolvers).toHaveLength(2))

    resolvers[1]('newest')
    resolvers[0]('stale')

    await waitFor(() => expect(result.current.data).toBe('newest'))
  })
})
