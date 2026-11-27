import { computed, onScopeDispose, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useQuranStore } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { surahName, verseKey } from '@/features/quran/lib/mushaf'
import { isHafsRecording } from '@/features/quran/lib/reciters'
import {
  clearMediaSession,
  setMediaHandlers,
  setMediaMetadata,
  setMediaPlaybackState,
} from '@/shared/utils/mediaSession'

export function useMushafRecitation() {
  const quranStore = useQuranStore()
  const radioStore = useRadioStore()

  const audio = new Audio()
  audio.preload = 'auto'

  const playing = ref(false)
  const loading = ref(false)
  // `ayah` is 0 while the Basmala plays.
  const surah = ref(null)
  const ayah = ref(null)
  const playingKey = computed(() =>
    playing.value && surah.value && ayah.value ? verseKey(surah.value, ayah.value) : null,
  )

  let timings = []
  let loadId = 0
  let pendingLoad = null

  function loadSurah(number) {
    const load = fetchSurah(number).finally(() => {
      if (pendingLoad === load) pendingLoad = null
    })
    pendingLoad = load
    return load
  }

  async function fetchSurah(number) {
    const id = ++loadId
    surah.value = number
    ayah.value = null
    timings = []
    audio.src = quranStore.surahAudioUrl(number)
    const listening = new AbortController()
    const [loadedTimings] = await Promise.all([
      quranStore.fetchAyahTimings(number).catch(() => []),
      new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', resolve, { signal: listening.signal })
        audio.addEventListener('error', reject, { signal: listening.signal })
      }),
    ]).finally(() => listening.abort())
    if (id !== loadId) throw new Error('superseded')
    // Timings only line up with Hafs recordings; others play without ayah following.
    timings = isHafsRecording(quranStore.reciter) ? loadedTimings.filter((t) => Number.isFinite(t.start_time)) : []
  }

  const startOf = (number) => {
    const timing = timings.find((t) => t.ayah === number)
    return timing ? timing.start_time / 1000 : 0
  }

  let playId = 0
  let disposed = false
  // Kept apart from `ayah` so a reciter change while loading resumes at the requested place.
  let requested = null

  async function playFrom(surahNumber, ayahNumber = 1) {
    if (disposed) return
    const id = ++playId
    requested = { surah: surahNumber, ayah: ayahNumber }
    if (radioStore.station) radioStore.stop()
    loading.value = true
    try {
      if (surah.value !== surahNumber || !audio.src) await loadSurah(surahNumber)
      else if (pendingLoad) await pendingLoad
      if (id !== playId) return
      if (ayahNumber > 1 && !timings.some((t) => t.ayah === ayahNumber)) {
        toast('لا يمكن البدء من هذه الآية مع هذا القارئ، ستبدأ التلاوة من أول السورة')
      }
      audio.currentTime = ayahNumber <= 1 ? 0 : startOf(ayahNumber)
      ayah.value = !timings.length ? null : ayahNumber <= 1 && timings.some((t) => t.ayah === 0) ? 0 : ayahNumber
      await audio.play()
      if (id !== playId) return
      playing.value = true
      updateMediaSession()
    } catch (error) {
      if (id !== playId || error?.message === 'superseded') return
      playing.value = false
      surah.value = null
      audio.removeAttribute('src')
      if (error?.name !== 'AbortError') toast.error('تعذر تشغيل التلاوة، برجاء المحاولة مرة أخرى')
    } finally {
      if (id === playId) loading.value = false
    }
  }

  function pause() {
    audio.pause()
    playing.value = false
    setMediaPlaybackState('paused')
  }

  function resume() {
    if (!audio.src) return
    if (radioStore.station) radioStore.stop()
    audio.play().then(
      () => {
        playing.value = true
        updateMediaSession()
      },
      () => (playing.value = false),
    )
  }

  function stop() {
    audio.pause()
    playing.value = false
    ayah.value = null
    setMediaPlaybackState('paused')
  }

  // Follow the recitation closely; timeupdate alone lags by up to a quarter of a second.
  let frame = 0
  function track() {
    frame = 0
    if (!playing.value) return
    const ms = audio.currentTime * 1000
    let current = null
    for (const timing of timings) {
      if (timing.start_time > ms) break
      current = timing.ayah
    }
    if (current !== null && current !== ayah.value) ayah.value = current
    frame = requestAnimationFrame(track)
  }
  watch(playing, (isPlaying) => {
    if (isPlaying && !frame) frame = requestAnimationFrame(track)
  })

  audio.addEventListener('pause', () => {
    if (playing.value) {
      playing.value = false
      setMediaPlaybackState('paused')
    }
  })

  audio.addEventListener('ended', () => {
    if (surah.value && surah.value < 114) playFrom(surah.value + 1, 1)
    else stop()
  })

  watch(
    () => quranStore.currentReciter,
    () => {
      const wasActive = playing.value || loading.value
      const at = loading.value && requested ? requested : { surah: surah.value, ayah: Math.max(1, ayah.value ?? 1) }
      loadId++
      playId++
      audio.pause()
      audio.removeAttribute('src')
      surah.value = null
      ayah.value = null
      playing.value = false
      loading.value = false
      if (wasActive && at.surah) playFrom(at.surah, at.ayah)
    },
  )

  watch(
    () => radioStore.isPlaying,
    (radioPlaying) => radioPlaying && playing.value && pause(),
  )

  function updateMediaSession() {
    setMediaMetadata({ title: `سورة ${surahName(surah.value)}`, artist: quranStore.reciter?.name ?? '' })
    setMediaHandlers({ play: resume, pause, stop })
    setMediaPlaybackState('playing')
  }

  // Also cancels a load in flight, which would otherwise start playing on another screen.
  onScopeDispose(() => {
    disposed = true
    cancelAnimationFrame(frame)
    loadId++
    playId++
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    if (!radioStore.station) clearMediaSession()
  })

  return { playing, loading, surah, ayah, playingKey, playFrom, pause, resume }
}
