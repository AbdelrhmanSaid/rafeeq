import { Link } from 'react-router-dom'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import OfflineState from '@/shared/ui/OfflineState'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList'
import radiosData from '@/features/radio/data/radios.js'
import { useRadioStore } from '@/features/radio/store'
import { useOnline } from '@/shared/hooks/useOnline'
import { ROUTES } from '@/app/router/routes'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import styles from './RadioView.module.scss'

const stations = Object.entries(radiosData).map(([slug, station]) => ({ slug, ...station }))

export default function RadioView() {
  const online = useOnline()
  const currentStation = useRadioStore((state) => state.station)
  const play = useRadioStore((state) => state.play)
  const stop = useRadioStore((state) => state.stop)

  if (!online) {
    return (
      <Page>
        <OfflineState />
      </Page>
    )
  }

  return (
    <Page>
      <Heading title="الإذاعة" subtitle="استمع لإذاعات القرآن الكريم المختلفة حول العالم" share />

      <div className={styles.list}>
        <SearchableFavoritesList
          items={stations}
          itemKey="slug"
          favoritesKey={STORAGE_KEYS.radioFavorites}
          searchType="search"
          placeholder="ابحث عن إذاعة"
          label="تبحث عن إذاعة معينة؟"
          itemClass={(item) => (currentStation === item.url ? 'active' : '')}
          favoritesTitle={<h5 className="mb-3">الإذاعات المفضلة</h5>}
          allTitle={<h5 className="mb-3">كل الإذاعات</h5>}
          renderItem={(item, index) => (
            <Link to={ROUTES.radioStation(item.slug)} className={`flex-grow-1 ${styles.link}`}>
              {toArabicNumerals(index + 1)}. {item.name}
            </Link>
          )}
          renderActions={(item) =>
            currentStation === item.url ? (
              <button className="btn btn-flat" onClick={stop} aria-label="إيقاف البث">
                <IconPlayerPause size="1.25rem" />
              </button>
            ) : (
              <button className="btn btn-flat" onClick={() => play(item.url)} aria-label="تشغيل البث">
                <IconPlayerPlay size="1.25rem" />
              </button>
            )
          }
        />
      </div>
    </Page>
  )
}
