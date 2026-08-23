// Owns a single HTMLAudioElement and a reconnect state machine for streamed
// audio. Framework-free: it reports state through `onChange` instead of driving
// the UI directly, so callers (e.g. toasts) react to `status` / `retryCount`
// without coupling to playback.
//
// status: 'idle' | 'playing' | 'retrying' | 'failed'
export function createAudioPlayer({ maxRetries = 3, retryDelay = 3000, onChange = () => {} } = {}) {
  const audio = new Audio()

  let state = { src: null, status: 'idle', retryCount: 0 }
  let retryTimer = null

  function update(patch) {
    state = { ...state, ...patch }
    onChange({ ...state, isPlaying: state.src !== null && !audio.paused && !audio.ended })
  }

  function clearRetry() {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  function teardown() {
    clearRetry()
    audio.pause()
    audio.src = ''
    update({ src: null, retryCount: 0 })
  }

  function retry() {
    if (!state.src || state.retryCount >= maxRetries) {
      teardown()
      update({ status: 'failed' })
      return
    }

    const src = state.src
    update({ retryCount: state.retryCount + 1, status: 'retrying' })

    retryTimer = setTimeout(() => {
      retryTimer = null
      audio.src = src
      audio.play().catch(() => {})
    }, retryDelay)
  }

  function play(url) {
    clearRetry()
    update({ src: url, status: 'idle', retryCount: 0 })
    audio.src = url
    audio.play().catch(() => {})
  }

  function stop() {
    teardown()
    update({ status: 'idle' })
  }

  audio.addEventListener('error', () => {
    if (state.src && !retryTimer) retry()
  })

  audio.addEventListener('playing', () => {
    update({ status: 'playing', retryCount: 0 })
  })

  return { play, stop, destroy: teardown }
}
