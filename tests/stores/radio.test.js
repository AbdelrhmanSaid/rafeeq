import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))

let lastAudio

// Stub the Audio element so play()/pause() are observable no-ops.
class AudioMock {
  constructor() {
    this.src = ''
    this.paused = true
    this.ended = false
    this._listeners = {}
    this.play = vi.fn(() => {
      this.paused = false
      return Promise.resolve()
    })
    this.pause = vi.fn(() => {
      this.paused = true
    })
    lastAudio = this
  }
  addEventListener(type, cb) {
    this._listeners[type] = cb
  }
  emit(type) {
    this._listeners[type]?.()
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  vi.stubGlobal('Audio', AudioMock)
})

describe('radio store', () => {
  it('starts with no active station', async () => {
    const { useRadioStore } = await import('@/stores/radio')
    const store = useRadioStore()
    expect(store.station).toBeNull()
    expect(store.isPlaying).toBe(false)
  })

  it('play() sets the station and starts the player', async () => {
    const { useRadioStore } = await import('@/stores/radio')
    const store = useRadioStore()

    store.play('https://example.com/stream')
    expect(store.station).toBe('https://example.com/stream')
    expect(lastAudio.src).toBe('https://example.com/stream')
    expect(lastAudio.play).toHaveBeenCalled()
    expect(store.isPlaying).toBe(true)
  })

  it('stop() clears the station and pauses the player', async () => {
    const { useRadioStore } = await import('@/stores/radio')
    const store = useRadioStore()

    store.play('https://example.com/stream')
    store.stop()
    expect(store.station).toBeNull()
    expect(lastAudio.pause).toHaveBeenCalled()
    expect(lastAudio.src).toBe('')
    expect(store.isPlaying).toBe(false)
  })

  it('shows a success toast when the connection is restored after a retry', async () => {
    vi.useFakeTimers()
    const { useRadioStore } = await import('@/stores/radio')
    const store = useRadioStore()

    store.play('https://example.com/stream')
    // simulate a stream error -> schedules a retry
    lastAudio.emit('error')
    // the retry's playing event after a reconnect
    lastAudio.emit('playing')

    expect(toast.success).toHaveBeenCalledWith('تم استعادة الاتصال بالإذاعة')
    vi.useRealTimers()
  })
})
