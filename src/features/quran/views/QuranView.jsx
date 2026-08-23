import { Link } from 'react-router-dom'
import { IconBookmark, IconChevronLeft } from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList'
import surahs from '@/features/quran/data/surahs.js'
import { useQuranBookmark } from '@/features/quran/hooks/useQuranBookmark'
import { ROUTES } from '@/app/router/routes'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import styles from './QuranView.module.scss'

export default function QuranView() {
  const { bookmark } = useQuranBookmark()

  return (
    <Page>
      <Heading
        title="القرآن الكريم"
        subtitle="إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه."
        share
      />

      {bookmark && (
        <Link to={`${ROUTES.quranSurah(bookmark.surahId)}?ayah=${bookmark.ayahNumber}`} className={styles.bookmarkCard}>
          <IconBookmark className={styles.bookmarkIcon} size="22" />
          <span className={styles.bookmarkBody}>
            <span className={styles.bookmarkLabel}>متابعة القراءة</span>
            <span className={styles.bookmarkTitle}>
              {bookmark.surahName} - آية {toArabicNumerals(bookmark.ayahNumber)}
            </span>
            {bookmark.text && <span className={`font-quran ${styles.bookmarkText}`}>{bookmark.text}</span>}
          </span>
          <IconChevronLeft className={styles.bookmarkChevron} size="20" />
        </Link>
      )}

      <SearchableFavoritesList
        items={surahs}
        itemKey="id"
        favoritesKey={STORAGE_KEYS.quranFavorites}
        placeholder="ابحث بالسورة"
        label="تبحث عن سورة معينة؟"
        favoritesTitle={<h5 className="mb-3">السور المفضلة</h5>}
        allTitle={<h5 className="mb-3">كل السور</h5>}
        renderItem={(item) => (
          <Link to={ROUTES.quranSurah(item.id)} className="stretched-link text-decoration-none text-reset">
            <p className="d-flex flex-column m-0">
              <span>
                {toArabicNumerals(item.id)}. {item.name}
              </span>
              <small>
                عدد الآيات: {toArabicNumerals(item.numberOfAyahs)} - {item.isMeccan ? 'مكية' : 'مدنية'}
              </small>
            </p>
          </Link>
        )}
      />
    </Page>
  )
}
