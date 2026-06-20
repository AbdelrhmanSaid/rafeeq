import { describe, it, expect, vi } from 'vitest'
import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useAsyncData } from './useAsyncData'

function runInScope(fn) {
  let api
  const scope = effectScope()
  scope.run(() => {
    api = fn()
  })
  return { api, scope }
}

describe('useAsyncData', () => {
  it('resolves data and clears pending', async () => {
    const { api, scope } = runInScope(() => useAsyncData(async () => ({ ok: 1 })))
    expect(api.pending.value).toBe(true)

    await flushPromises()

    expect(api.pending.value).toBe(false)
    expect(api.data.value).toEqual({ ok: 1 })
    expect(api.error.value).toBe(null)
    scope.stop()
  })

  it('captures a rejected fetch as error', async () => {
    const { api, scope } = runInScope(() => useAsyncData(() => Promise.reject(new Error('boom'))))

    await flushPromises()

    expect(api.pending.value).toBe(false)
    expect(api.error.value).toBeInstanceOf(Error)
    expect(api.data.value).toBe(null)
    scope.stop()
  })

  it('does not fetch immediately when immediate is false', () => {
    const fetcher = vi.fn()
    const { scope } = runInScope(() => useAsyncData(fetcher, { immediate: false }))

    expect(fetcher).not.toHaveBeenCalled()
    scope.stop()
  })
})
