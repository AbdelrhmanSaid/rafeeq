import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { toast } from 'sonner'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import BackButton from '@/shared/ui/BackButton'
import AsyncContent from '@/shared/ui/AsyncContent'
import QuranPlayer from '@/features/quran/components/QuranPlayer'
import AyahActionSheet from '@/features/quran/components/AyahActionSheet'
import TafseerSheet from '@/features/quran/components/TafseerSheet'
import { fetchSurah } from '@/features/quran/api'
import { useQuranStore, selectCurrentAyah } from '@/features/quran/store'
import { useQuranBookmark } from '@/features/quran/hooks/useQuranBookmark'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { useOnline } from '@/shared/hooks/useOnline'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { ROUTES } from '@/app/router/routes'
import { toArabicNumerals, removeBismillah, normalizeQuranicText } from '@/shared/utils/arabic'
import styles from './QuranSurahView.module.scss'

const FIRST_SURAH = 1
const LAST_SURAH = 114

export default function QuranSurahView() {
  const { surah: surahParam } = useParams()
  const [searchParams] = useSearchParams()
  const surahNumber = Number(surahParam)

  const online = useOnline()
  const playerRef = useRef(null)

  const { isBookmarked, toggleBookmark } = useQuranBookmark()
  const currentAyah = useQuranStore(selectCurrentAyah)

  const fetcher = useCallback(async () => {
    const result = await fetchSurah(surahParam)

    if (navigator.onLine && result) {
      await useQuranStore.getState().loadSurahAudio(result.data.number, result.data.name)
    }

    return result
  }, [surahParam])

  const { data: surah, error, pending: isFetching } = useAsyncData(fetcher, { deps: [surahParam] })

  // The component is reused when only the :surah param changes (e.g. the
  // prev/next buttons), so scroll back to the top on each switch.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [surahParam])

  const revelationLabel = surah?.data.revelationType === 'Meccan' ? 'مكية' : 'مدنية'

  usePageMeta(
    surah && {
      title: surah.data.name,
      description: `قراءة وتلاوة سورة ${surah.data.name} - ${toArabicNumerals(surah.data.numberOfAyahs)} آية - سورة ${revelationLabel}`,
      keywords: ['قرآن', 'سورة', surah.data.name, 'تلاوة', 'قراءة', 'رفيق'],
    },
  )

  const ayat = useMemo(() => {
    if (!surah) return []

    // Al-Fatiha counts the basmala as its first ayah; every other surah carries
    // it as a prefix of the first ayah's text.
    const verses = surah.data.number === 1 ? surah.data.ayahs.slice(1) : surah.data.ayahs

    return verses.map((ayah) => ({
      ...ayah,
      text: (ayah.numberInSurah === 1 ? removeBismillah(ayah.text) : ayah.text).trim(),
    }))
  }, [surah])

  // Each sheet keeps its ayah after closing, so its content doesn't vanish
  // mid-animation; `show` alone drives open/closed.
  const [activeAyah, setActiveAyah] = useState(null)
  const [showActions, setShowActions] = useState(false)
  const [tafseerAyah, setTafseerAyah] = useState(null)
  const [showTafseer, setShowTafseer] = useState(false)

  // Navigate the tafseer sheet through the surah's ayat without leaving the sheet.
  const tafseerIndex = ayat.findIndex((ayah) => ayah.number === tafseerAyah?.number)
  const stepTafseer = (delta) => {
    const next = ayat[tafseerIndex + delta]
    if (next) setTafseerAyah(next)
  }

  const openActions = (ayah) => {
    setActiveAyah(ayah)
    setShowActions(true)
  }

  const openTafseer = () => {
    setTafseerAyah(activeAyah)
    setShowTafseer(true)
  }

  const isBookmarkedVerse = (verse) => isBookmarked(surahParam, verse.numberInSurah)

  const handleBookmark = () => {
    if (!activeAyah || !surah) return

    const wasBookmarked = isBookmarkedVerse(activeAyah)

    toggleBookmark({
      surahId: surah.data.number,
      surahName: surah.data.name,
      ayahNumber: activeAyah.numberInSurah,
      text: activeAyah.text,
    })

    toast.success(wasBookmarked ? 'تمت إزالة الإشارة المرجعية' : 'تم حفظ الإشارة المرجعية')
  }

  // When arriving with ?ayah=N (e.g. from the bookmark card), bring that ayah
  // into view once the surah has rendered.
  const requestedAyah = searchParams.get('ayah')
  useEffect(() => {
    if (!surah || !requestedAyah) return

    document.getElementById(`ayah-${Number(requestedAyah)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [surah, requestedAyah])

  return (
    <AsyncContent pending={isFetching} error={error} loadingMessage="جاري تحميل السورة...">
      {surah && (
        <Page className={styles.page}>
          <Heading
            title={normalizeQuranicText(surah.data.name)}
            subtitle={`عدد الآيات: ${toArabicNumerals(surah.data.numberOfAyahs)} آية - سورة ${revelationLabel}`}
            share
          />

          {online && <QuranPlayer ref={playerRef} />}

          <div className={`${styles.ayat} font-quran mb-4`}>
            {surahNumber !== 9 && <span className={styles.basmallah}>بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ</span>}

            {ayat.map((ayah, index) => (
              <Fragment key={ayah.number}>
                <span
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`ayah ${currentAyah?.ayah === ayah.numberInSurah ? styles.currentAyah : ''} ${
                    isBookmarkedVerse(ayah) ? styles.bookmarkedAyah : ''
                  }`}
                  onClick={() => openActions(ayah)}
                  title={`خيارات الآية ${toArabicNumerals(ayah.numberInSurah)}`}
                >
                  {ayah.text}
                </span>
                <span className="ayah-number" aria-hidden="true">
                  {toArabicNumerals(ayah.numberInSurah)}
                </span>
                {index < ayat.length - 1 && ayah.page !== ayat[index + 1].page && (
                  <div className={styles.pageSeparator}>
                    <span className={styles.pageNumber}>{toArabicNumerals(ayah.page)}</span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <div className="d-flex justify-content-center align-items-center gap-2">
            <Link
              to={ROUTES.quranSurah(surahNumber - 1)}
              className={`btn btn-flat d-inline-flex align-items-center gap-2 ${surahNumber === FIRST_SURAH ? 'disabled' : ''}`}
            >
              <IconArrowRight size="1.25rem" />
              <span>السابقة</span>
            </Link>

            <BackButton to={ROUTES.quran} buttonClass="btn-primary" />

            <Link
              to={ROUTES.quranSurah(surahNumber + 1)}
              className={`btn btn-flat d-inline-flex align-items-center gap-2 ${surahNumber === LAST_SURAH ? 'disabled' : ''}`}
            >
              <span>التالية</span>
              <IconArrowLeft size="1.25rem" />
            </Link>
          </div>

          <AyahActionSheet
            show={showActions}
            ayah={activeAyah}
            surahName={surah.data.name}
            online={online}
            bookmarked={!!activeAyah && isBookmarkedVerse(activeAyah)}
            onRecite={() => playerRef.current?.seekToAyah(activeAyah?.numberInSurah)}
            onTafseer={openTafseer}
            onBookmark={handleBookmark}
            onClose={() => setShowActions(false)}
          />

          <TafseerSheet
            show={showTafseer}
            ayah={tafseerAyah}
            hasPrev={tafseerIndex > 0}
            hasNext={tafseerIndex >= 0 && tafseerIndex < ayat.length - 1}
            onPrev={() => stepTafseer(-1)}
            onNext={() => stepTafseer(1)}
            onClose={() => setShowTafseer(false)}
          />
        </Page>
      )}
    </AsyncContent>
  )
}
