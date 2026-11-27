import { ref, computed, onScopeDispose } from 'vue'

export function useAudioPlayer({ maxRetries = 3, retryDelay = 3000 } = {}) {
  const audio = new Audio()

  const src = ref(null)
  const status = ref('idle')
  const retryCount = ref(0)
  let retryTimer = null

  // Only true once sound is actually coming out; `audio.paused` isn't reactive and flips as soon as play() is called.
  const isPlaying = computed(() => src.value !== null && status.value === 'playing')

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
    status.value = 'connecting'
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
  audio.addEventListener('waiting', () => {
    if (status.value === 'playing') status.value = 'connecting'
  })
  audio.addEventListener('pause', () => {
    if (src.value && status.value === 'playing') status.value = 'paused'
  })

  onScopeDispose(teardown)

  return { src, isPlaying, status, retryCount, play, stop }
}
