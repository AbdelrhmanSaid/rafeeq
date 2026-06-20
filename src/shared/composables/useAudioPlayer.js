import { ref, computed, onScopeDispose } from 'vue'

// Owns a single HTMLAudioElement and a reconnect state machine for streamed
// audio. Exposes reactive state instead of triggering UI directly, so callers
// (e.g. toasts) react to `status` / `retryCount` without coupling to playback.
//
// status: 'idle' | 'playing' | 'retrying' | 'failed'
export function useAudioPlayer({ maxRetries = 3, retryDelay = 3000 } = {}) {
  const audio = new Audio()

  const src = ref(null)
  const status = ref('idle')
  const retryCount = ref(0)
  let retryTimer = null

  const isPlaying = computed(() => src.value !== null && !audio.paused && !audio.ended)

  function clearRetry() {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  function teardown() {
    clearRetry()
    retryCount.value = 0
    audio.pause()
    audio.src = ''
    src.value = null
  }

  function retry() {
    if (!src.value || retryCount.value >= maxRetries) {
      teardown()
      status.value = 'failed'
      return
    }

    retryCount.value++
    status.value = 'retrying'
    retryTimer = setTimeout(() => {
      retryTimer = null
      audio.src = src.value
      audio.play().catch(() => {})
    }, retryDelay)
  }

  function play(url) {
    clearRetry()
    retryCount.value = 0
    status.value = 'idle'
    src.value = url
    audio.src = url
    audio.play().catch(() => {})
  }

  function stop() {
    teardown()
    status.value = 'idle'
  }

  audio.addEventListener('error', () => {
    if (src.value && !retryTimer) retry()
  })
  audio.addEventListener('playing', () => {
    status.value = 'playing'
    retryCount.value = 0
  })

  onScopeDispose(teardown)

  return { src, isPlaying, status, retryCount, play, stop }
}
