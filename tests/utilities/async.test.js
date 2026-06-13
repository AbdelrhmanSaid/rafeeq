import { describe, it, expect, vi, afterEach } from 'vitest'
import { sleep } from '@/utilities/async'

afterEach(() => {
  vi.useRealTimers()
})

describe('sleep', () => {
  it('returns a promise', () => {
    expect(sleep(0)).toBeInstanceOf(Promise)
  })

  it('resolves after the given delay', async () => {
    vi.useFakeTimers()
    const spy = vi.fn()
    const promise = sleep(500).then(spy)

    expect(spy).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(499)
    expect(spy).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await promise
    expect(spy).toHaveBeenCalledOnce()
  })

  it('resolves immediately enough for a zero delay', async () => {
    await expect(sleep(0)).resolves.toBeUndefined()
  })
})
