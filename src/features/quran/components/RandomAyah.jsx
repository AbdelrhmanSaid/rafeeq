import { useEffect, useMemo, useRef, useState } from 'react'
import { IconRefresh, IconChevronRight, IconChevronLeft, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'
import { toast } from 'sonner'

import LoadingState from '@/shared/ui/LoadingState'
import ErrorState from '@/shared/ui/ErrorState'
import OfflineState from '@/shared/ui/OfflineState'
import { useQuranStore } from '@/features/quran/store'
import { useJsonFetch } from '@/shared/hooks/useJsonFetch'
import { useOnline } from '@/shared/hooks/useOnline'
import { useReconnectExecute } from '@/shared/hooks/useReconnectExecute'
import { toArabicNumerals, removeBismillah, normalizeQuranicText } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'

const TOTAL_AYAHS = 6236

const randomAyahNumber = () => Math.floor(Math.random() * TOTAL_AYAHS) + 1

export default function RandomAyah({ className = '' }) {
  const online = useOnline()
  const currentTafseer = useQuranStore((state) => state.currentTafseer)

  const [current, setCurrent] = useState(randomAyahNumber)

  const endpoint = `${API.quranCloud}/ayah/${current}/editions/${['quran-uthmani', currentTafseer, 'ar.alafasy'].join(',')}`
  const { data, error, pending: isFetching, execute } = useJsonFetch(endpoint)
  const { isRecoveringOnReconnect } = useReconnectExecute(execute)

  const [ayah, tafsir, recitation] = data?.data ?? []

  const audioRef = useRef(null)
  if (audioRef.current === null) audioRef.current = new Audio()

  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current

    const onPlay = () => setIsPlaying(true)
    const onStop = () => setIsPlaying(false)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onStop)
    audio.addEventListener('ended', onStop)

    return () => {
      audio.pause()
      audio.currentTime = 0
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onStop)
      audio.removeEventListener('ended', onStop)
    }
  }, [])

  // Switching ayah stops whatever is playing and arms the new recitation.
  useEffect(() => {
    const audio = audioRef.current
    audio.pause()
    audio.currentTime = 0
    if (recitation?.audio) audio.src = recitation.audio
  }, [recitation?.audio])

  const displayText = useMemo(() => {
    if (!ayah?.text) return ''
    if (ayah.surah.number !== 1 && ayah.numberInSurah === 1) return removeBismillah(ayah.text)
    return ayah.text.trim()
  }, [ayah])

  const toggleAyahPlayback = async () => {
    if (!recitation?.audio) return

    if (isPlaying) {
      audioRef.current.pause()
      return
    }

    try {
      await audioRef.current.play()
    } catch {
      toast.error('تعذر تشغيل التلاوة، برجاء المحاولة مرة أخرى')
    }
  }

  const step = (delta) => setCurrent((value) => ((value - 1 + delta + TOTAL_AYAHS) % TOTAL_AYAHS) + 1)

  return (
    <div className={`card ${className}`}>
      {isFetching || isRecoveringOnReconnect ? (
        <div className="card-body p-5">
          <LoadingState message="جاري تحميل آية..." />
        </div>
      ) : error ? (
        <div className="card-body p-5">
          {online ? (
            <ErrorState code={500} message="حدث خطأ أثناء تحميل الآية، برجاء المحاولة مرة أخرى." />
          ) : (
            <OfflineState />
          )}
        </div>
      ) : (
        ayah && (
          <>
            <div className="card-header d-flex align-items-center justify-content-between py-2">
              <span className="fw-semibold">{normalizeQuranicText(ayah.surah.name)}</span>

              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-flat btn-icon"
                  onClick={() => step(-1)}
                  title="الآية السابقة"
                  aria-label="الآية السابقة"
                >
                  <IconChevronRight size="18" />
                </button>

                <button
                  className="btn btn-flat btn-icon"
                  onClick={() => step(1)}
                  title="الآية التالية"
                  aria-label="الآية التالية"
                >
                  <IconChevronLeft size="18" />
                </button>

                <button
                  className="btn btn-flat btn-icon"
                  onClick={toggleAyahPlayback}
                  disabled={!recitation?.audio}
                  title={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
                  aria-label={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
                >
                  {isPlaying ? <IconPlayerPause size="18" /> : <IconPlayerPlay size="18" />}
                </button>

                <button
                  className="btn btn-flat btn-icon"
                  onClick={() => setCurrent(randomAyahNumber)}
                  title="آية جديدة"
                  aria-label="تحميل آية جديدة"
                >
                  <IconRefresh size="18" />
                </button>
              </div>
            </div>

            <div className="card-body">
              <p className={`fs-2 text-center lh-lg font-quran ${tafsir ? 'mb-4' : 'mb-0'}`}>
                {displayText} <span className="ayah-number">{toArabicNumerals(ayah.numberInSurah)}</span>
              </p>

              {tafsir && (
                <>
                  <span className="d-block small fw-semibold text-secondary mb-2">{tafsir.edition.name}</span>
                  <p className="small mb-0">{tafsir.text}</p>
                </>
              )}
            </div>
          </>
        )
      )}
    </div>
  )
}
