import { describe, it, expect, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useReconnectExecute } from './useReconnectExecute'

describe('useReconnectExecute', () => {
  it('runs execute when the connection is restored', async () => {
    const online = ref(false)
    const execute = vi.fn().mockResolvedValue(undefined)
    useReconnectExecute(online, execute)

    online.value = true
    await nextTick()

    expect(execute).toHaveBeenCalledTimes(1)
  })

  it('does not run execute when going offline', async () => {
    const online = ref(true)
    const execute = vi.fn().mockResolvedValue(undefined)
    useReconnectExecute(online, execute)

    online.value = false
    await nextTick()

    expect(execute).not.toHaveBeenCalled()
  })

  it('toggles isRecoveringOnReconnect around the execute call', async () => {
    const online = ref(false)
    let resolveExecute
    const execute = vi.fn(() => new Promise((resolve) => (resolveExecute = resolve)))
    const { isRecoveringOnReconnect } = useReconnectExecute(online, execute)

    online.value = true
    await nextTick()
    expect(isRecoveringOnReconnect.value).toBe(true)

    resolveExecute()
    await nextTick()
    expect(isRecoveringOnReconnect.value).toBe(false)
  })
})
