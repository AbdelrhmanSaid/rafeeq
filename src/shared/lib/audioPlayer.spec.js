import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createAudioPlayer } from './audioPlayer'

const instances = []

class FakeAudio {
  constructor() {
    instances.push(this)
    this.paused = true
    this.ended = false
    this.src = ''
    this._listeners = {}
  }
  addEventListener(event, callback) {
    ;(this._listeners[event] ||= []).push(callback)
  }
  emit(event) {
    ;(this._listeners[event] || []).forEach((callback) => callback())
  }
  play() {
    this.paused = false
    return Promise.resolve()
  }
  pause() {
    this.paused = true
  }
}

let state

function create(options) {
  state = { src: null, isPlaying: false, status: 'idle', retryCount: 0 }
  return createAudioPlayer({ ...options, onChange: (next) => (state = next) })
}

beforeEach(() => {
  vi.useFakeTimers()
  instances.length = 0
  vi.stubGlobal('Audio', FakeAudio)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createAudioPlayer', () => {
  it('plays a url and reports playing once the audio element fires playing', () => {
    const player = create()
    player.play('http://stream/1')

    const audio = instances[0]
    expect(state.src).toBe('http://stream/1')
    expect(audio.src).toBe('http://stream/1')

    audio.emit('playing')
    expect(state.status).toBe('playing')
    expect(state.isPlaying).toBe(true)
  })

  it('retries up to maxRetries on error, then fails', () => {
    const player = create({ maxRetries: 3, retryDelay: 1000 })
    player.play('u')
    const audio = instances[0]

    for (let attempt = 1; attempt <= 3; attempt++) {
      audio.emit('error')
      expect(state.retryCount).toBe(attempt)
      expect(state.status).toBe('retrying')
      vi.advanceTimersByTime(1000)
      expect(audio.src).toBe('u')
    }

    audio.emit('error')
    expect(state.status).toBe('failed')
    expect(state.src).toBe(null)
  })

  it('reports recovery when playing resumes after a retry', () => {
    const player = create()
    player.play('u')
    const audio = instances[0]

    audio.emit('error')
    expect(state.status).toBe('retrying')

    audio.emit('playing')
    expect(state.status).toBe('playing')
    expect(state.retryCount).toBe(0)
  })

  it('stop tears the player down', () => {
    const player = create()
    player.play('u')
    player.stop()

    expect(state.src).toBe(null)
    expect(state.status).toBe('idle')
    expect(instances[0].paused).toBe(true)
  })
})
