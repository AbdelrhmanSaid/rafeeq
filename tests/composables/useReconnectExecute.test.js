import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useReconnectExecute } from '@/composables/useReconnectExecute'

describe('useReconnectExecute', () => {
  it('does not run on the very first value (no previous value)', async () => {
    const online = ref(true)
    const execute = vi.fn()
    useReconnectExecute(online, execute)

    online.value = true
    await nextTick()
    expect(execute).not.toHaveBeenCalled()
  })

  it('does not run when going offline', async () => {
    const online = ref(true)
    const execute = vi.fn()
    useReconnectExecute(online, execute)

    online.value = false
    await nextTick()
    expect(execute).not.toHaveBeenCalled()
  })

  it('runs execute when reconnecting (offline -> online)', async () => {
    const online = ref(true)
    const execute = vi.fn().mockResolvedValue(undefined)
    useReconnectExecute(online, execute)

    online.value = false
    await nextTick()
    online.value = true
    await nextTick()

    expect(execute).toHaveBeenCalledOnce()
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
    await nextTick()
    expect(isRecoveringOnReconnect.value).toBe(false)
  })

  it('clears the recovering flag and swallows the error if execute rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const online = ref(false)
    const execute = vi.fn().mockRejectedValue(new Error('fail'))
    const { isRecoveringOnReconnect } = useReconnectExecute(online, execute)

    online.value = true
    await nextTick()
    await nextTick()

    expect(isRecoveringOnReconnect.value).toBe(false)
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
