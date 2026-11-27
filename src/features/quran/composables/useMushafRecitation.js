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

// Plays the reciter's recording surah by surah, follows the ayah being recited from the recording's timings, and runs
// on into the next surah, the way a Mushaf app reads on page after page.
export function useMushafRecitation() {
  const quranStore = useQuranStore()
  const radioStore = useRadioStore()

  const audio = new Audio()
  audio.preload = 'auto'

  const playing = ref(false)
  const loading = ref(false)
  // The surah loaded and the ayah being recited (0 while the Basmala plays).
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
    // Without timings, or for a recording not in Hafs, the surah still plays; only the following stops.
    timings = isHafsRecording(quranStore.reciter) ? loadedTimings.filter((t) => Number.isFinite(t.start_time)) : []
  }

  // Seconds into the recording; an ayah without a timing plays from the start of the surah.
  const startOf = (number) => {
    const timing = timings.find((t) => t.ayah === number)
    return timing ? timing.start_time / 1000 : 0
  }

  let playId = 0
  let disposed = false
  // What was asked for, kept apart from the ayah playing, so a reciter change while loading keeps the right place.
  let requested = null

  // Starts reciting at an ayah; ayah 1 starts with the surah's Basmala.
  async function playFrom(surahNumber, ayahNumber = 1) {
    if (disposed) return
    const id = ++playId
    requested = { surah: surahNumber, ayah: ayahNumber }
    if (radioStore.isPlaying) radioStore.stop()
    loading.value = true
    try {
      if (surah.value !== surahNumber || !audio.src) await loadSurah(surahNumber)
      else if (pendingLoad) await pendingLoad
      if (id !== playId) return
      // Without a timing for the ayah (no timings, or not a Hafs recording) it can only start at the top.
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
      // A recording that failed to load is tried again next time.
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
    if (radioStore.isPlaying) radioStore.stop()
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

  // Paused from outside the app (a call, headphones unplugged, the lock screen) shows as paused here too.
  audio.addEventListener('pause', () => {
    if (playing.value) {
      playing.value = false
      setMediaPlaybackState('paused')
    }
  })

  // The end of a surah carries on into the next one.
  audio.addEventListener('ended', () => {
    if (surah.value && surah.value < 114) playFrom(surah.value + 1, 1)
    else stop()
  })

  // Another reciter picks up where this one was.
  watch(
    () => quranStore.currentReciter,
    () => {
      // Includes a recitation still loading, which must not go on to play the old reciter.
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

  // The radio taking over stops the recitation.
  watch(
    () => radioStore.isPlaying,
    (radioPlaying) => radioPlaying && playing.value && pause(),
  )

  function updateMediaSession() {
    setMediaMetadata({ title: `سورة ${surahName(surah.value)}`, artist: quranStore.reciter?.name ?? '' })
    setMediaHandlers({ play: resume, pause, stop })
    setMediaPlaybackState('playing')
  }

  // Leaving the reader ends the recitation, including one still loading, which would otherwise start playing on
  // another screen with nothing there to stop it.
  onScopeDispose(() => {
    disposed = true
    cancelAnimationFrame(frame)
    loadId++
    playId++
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    if (!radioStore.isPlaying) clearMediaSession()
  })

  return { playing, loading, surah, ayah, playingKey, playFrom, pause, resume, stop }
}
