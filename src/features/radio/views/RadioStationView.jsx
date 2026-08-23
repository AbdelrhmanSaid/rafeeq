import { useParams } from 'react-router-dom'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import BackButton from '@/shared/ui/BackButton'
import OfflineState from '@/shared/ui/OfflineState'
import RadioPlayer from '@/features/radio/components/RadioPlayer'
import radiosData from '@/features/radio/data/radios.js'
import { useRadioStore } from '@/features/radio/store'
import { useFavorites } from '@/shared/hooks/useFavorites'
import { useOnline } from '@/shared/hooks/useOnline'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { ROUTES } from '@/app/router/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export default function RadioStationView() {
  const { slug } = useParams()
  const stationSlug = slug.toLowerCase()
  const station = radiosData[stationSlug]

  const online = useOnline()
  const currentStation = useRadioStore((state) => state.station)
  const play = useRadioStore((state) => state.play)
  const stop = useRadioStore((state) => state.stop)
  const { isFavorite, toggleFavorite } = useFavorites(STORAGE_KEYS.radioFavorites)

  const isPlaying = !!station && currentStation === station.url

  usePageMeta(
    station && {
      title: station.name,
      description: `استمع إلى ${station.name} بث مباشر`,
      keywords: ['إذاعة', 'راديو', 'قرآن', station.name, 'بث مباشر'],
    },
  )

  const shareStation = async () => {
    if (!station || !navigator.share) return

    try {
      await navigator.share({
        title: station.name,
        text: `استمع إلى ${station.name}`,
        url: window.location.href,
      })
    } catch {
      // User canceled or share failed
    }
  }

  if (!online) {
    return (
      <Page>
        <OfflineState />
      </Page>
    )
  }

  return (
    <Page className="full-height d-flex align-items-center justify-content-center">
      {station ? (
        <RadioPlayer
          station={station}
          isPlaying={isPlaying}
          isFavorite={isFavorite(stationSlug)}
          canShare={canShare}
          onToggle={() => (isPlaying ? stop() : play(station.url))}
          onFavorite={() => toggleFavorite(stationSlug)}
          onShare={shareStation}
        />
      ) : (
        <div className="text-center py-5 px-3">
          <div className="display-1 mb-4 opacity-50">📻</div>
          <Heading title="لم يتم العثور على الإذاعة" subtitle="يمكنك العودة لقائمة الإذاعات المتاحة." />
          <BackButton to={ROUTES.radio} label="العودة إلى الإذاعات" buttonClass="btn-primary" />
        </div>
      )}
    </Page>
  )
}
