import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope } from 'vue'
import { useAudioPlayer } from './useAudioPlayer'

const instances = []

class FakeAudio {
  constructor() {
    instances.push(this)
    this.paused = true
    this.ended = false
    this.src = ''
    this._listeners = {}
  }
  addEventListener(event, cb) {
    ;(this._listeners[event] ||= []).push(cb)
  }
  emit(event) {
    ;(this._listeners[event] || []).forEach((cb) => cb())
  }
  play() {
    this.paused = false
    return Promise.resolve()
  }
  pause() {
    this.paused = true
  }
}

let scope

function create(opts) {
  let api
  scope = effectScope()
  scope.run(() => {
    api = useAudioPlayer(opts)
  })
  return api
}

beforeEach(() => {
  vi.useFakeTimers()
  instances.length = 0
  vi.stubGlobal('Audio', FakeAudio)
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useAudioPlayer', () => {
  it('plays a url and reports playing once the audio element fires playing', () => {
    const player = create()
    player.play('http://stream/1')

    const audio = instances[0]
    expect(player.src.value).toBe('http://stream/1')
    expect(audio.src).toBe('http://stream/1')

    audio.emit('playing')
    expect(player.status.value).toBe('playing')
    expect(player.isPlaying.value).toBe(true)
  })

  it('retries up to maxRetries on error, then fails', () => {
    const player = create({ maxRetries: 3, retryDelay: 1000 })
    player.play('u')
    const audio = instances[0]

    for (let attempt = 1; attempt <= 3; attempt++) {
      audio.emit('error')
      expect(player.retryCount.value).toBe(attempt)
      expect(player.status.value).toBe('retrying')
      vi.advanceTimersByTime(1000)
      expect(audio.src).toBe('u')
    }

    audio.emit('error')
    expect(player.status.value).toBe('failed')
    expect(player.src.value).toBe(null)
  })

  it('reports recovery when playing resumes after a retry', () => {
    const player = create()
    player.play('u')
    const audio = instances[0]

    audio.emit('error')
    expect(player.status.value).toBe('retrying')

    audio.emit('playing')
    expect(player.status.value).toBe('playing')
    expect(player.retryCount.value).toBe(0)
  })

  it('stop tears the player down', () => {
    const player = create()
    player.play('u')
    player.stop()

    expect(player.src.value).toBe(null)
    expect(player.status.value).toBe('idle')
    expect(instances[0].paused).toBe(true)
  })
})
