import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { IconPlayerPlay, IconPlayerPause, IconMicrophone2, IconGauge } from '@tabler/icons-react'

import BottomSheet from '@/shared/ui/BottomSheet'
import SettingsReciter from '@/features/settings/components/SettingsReciter'
import { SettingsBareContext } from '@/features/settings/components/settingsBareContext'
import { useQuranStore, selectCurrentAyah, selectReciter, PLAYBACK_RATES } from '@/features/quran/store'
import { useRadioStore } from '@/features/radio/store'
import { toArabicNumerals, formatTime } from '@/shared/utils/arabic'
import styles from './QuranPlayer.module.scss'

// Plays the current surah and follows along ayah by ayah. `ref` exposes
// seekToAyah so the surah view can start playback from a tapped verse.
export default function QuranPlayer({ ref }) {
  const audioRef = useRef(null)

  const surahAudioUrl = useQuranStore((state) => state.surahAudioUrl)
  const surahName = useQuranStore((state) => state.surahName)
  const playbackRate = useQuranStore((state) => state.playbackRate)
  const currentAyah = useQuranStore(selectCurrentAyah)
  const reciter = useQuranStore(selectReciter)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [showReciterSheet, setShowReciterSheet] = useState(false)
  const reciterOnOpen = useRef(null)

  const openReciterSheet = () => {
    reciterOnOpen.current = Number(useQuranStore.getState().currentReciter)
    setShowReciterSheet(true)
  }

  // Only download the new reciter's audio once the sheet closes, and only if the
  // selection actually changed — avoids a request per pick while browsing.
  const closeReciterSheet = () => {
    setShowReciterSheet(false)

    const { currentReciter, reloadSurahAudio } = useQuranStore.getState()
    if (Number(currentReciter) !== reciterOnOpen.current) reloadSurahAudio()
  }

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    const { isPlaying: radioIsPlaying, stop: stopRadio } = useRadioStore.getState()
    if (radioIsPlaying) stopRadio()

    // The browser resets playbackRate on every source load, so set it before play.
    audio.playbackRate = Number(useQuranStore.getState().playbackRate)

    // `isPlaying` follows the element's own play/pause events, so a failed
    // play() needs no state handling of its own.
    await audio.play().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }

    setCurrentTime(0)
    useQuranStore.getState().resetAyahTracking()
  }, [])

  const togglePlayPause = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      return
    }

    await tryPlay()
  }

  const seekToAyah = useCallback(
    async (ayahNumber) => {
      const store = useQuranStore.getState()

      if (isPlaying && selectCurrentAyah(store)?.ayah === ayahNumber) {
        stop()
        return
      }

      const startTime = store.getAyahStartTime(ayahNumber)
      if (startTime === null || !audioRef.current) return

      audioRef.current.currentTime = startTime
      store.updateCurrentAyahFromTime(startTime * 1000)
      await tryPlay()
    },
    [isPlaying, stop, tryPlay],
  )

  useImperativeHandle(ref, () => ({ seekToAyah }), [seekToAyah])

  // A new surah (or reciter) replaces the source; the element's own events
  // then reset the play state and progress.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !surahAudioUrl) return

    audio.src = surahAudioUrl
    audio.load()
  }, [surahAudioUrl])

  // Speed changes apply immediately, even mid-playback.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = Number(playbackRate)
  }, [playbackRate])

  useEffect(() => {
    const audio = audioRef.current
    return () => audio?.pause()
  }, [])

  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTime(audio.currentTime)
    if (isPlaying) useQuranStore.getState().updateCurrentAyahFromTime(audio.currentTime * 1000)
  }

  // Advance to the next speed preset, wrapping back to the slowest at the end.
  const cycleRate = () => {
    const index = PLAYBACK_RATES.indexOf(Number(playbackRate))
    useQuranStore.getState().setPlaybackRate(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length])
  }

  const progress = duration ? (currentTime / duration) * 100 : 0
  const rateLabel = `${toArabicNumerals(playbackRate).replace('.', '٫')}×`

  return (
    <div className="card">
      <div className="card-body d-flex align-items-center gap-3">
        <button
          onClick={togglePlayPause}
          className={`btn btn-primary rounded-circle d-flex align-items-center justify-content-center ${styles.playButton}`}
          disabled={isLoading || !surahAudioUrl}
          aria-label={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
        >
          {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
        </button>

        <div className="flex-grow-1 min-w-0">
          {currentAyah && surahName ? (
            <>
              <span className="d-inline-block fw-semibold text-primary me-2">{surahName}</span>
              {currentAyah.ayah > 0 && (
                <span className="d-inline-block text-secondary small">آية {toArabicNumerals(currentAyah.ayah)}</span>
              )}
            </>
          ) : surahName ? (
            <span className="text-muted">{surahName}</span>
          ) : (
            <span className="text-muted">اضغط على آية للاستماع</span>
          )}
        </div>

        <button
          onClick={openReciterSheet}
          className={`btn btn-sm d-flex align-items-center gap-1 flex-shrink-0 ${styles.reciterChip}`}
          title={`القارئ: ${reciter?.name}`}
        >
          <IconMicrophone2 size="18" />
          <span className={`small text-truncate ${styles.name}`}>{reciter?.name}</span>
        </button>
      </div>

      {/* Render settings cards (the reciter picker) form-only inside the sheet —
          the sheet provides its own title, so the card chrome would be redundant. */}
      <BottomSheet show={showReciterSheet} title="اختيار القارئ" onClose={closeReciterSheet}>
        <div className="p-3">
          <SettingsBareContext value={true}>
            <SettingsReciter />
          </SettingsBareContext>
        </div>
      </BottomSheet>

      <div className="px-3 pb-3">
        <div className="progress" style={{ height: '0.25rem' }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="d-flex justify-content-between align-items-center small text-muted mt-1">
          <span>{formatTime(currentTime)}</span>

          <div className="d-flex align-items-center gap-2">
            <span>{formatTime(duration)}</span>

            <button
              type="button"
              className="btn btn-flat btn-sm d-flex align-items-center gap-1"
              onClick={cycleRate}
              title={`سرعة التلاوة: ${rateLabel}`}
            >
              <IconGauge size="15" />
              <span>{rateLabel}</span>
            </button>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEmptied={() => setCurrentTime(0)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onTimeUpdate={onTimeUpdate}
        onEnded={stop}
        onLoadedMetadata={(event) => setDuration(event.target.duration)}
        preload="metadata"
      ></audio>
    </div>
  )
}
