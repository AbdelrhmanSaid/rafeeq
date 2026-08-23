import { Link } from 'react-router-dom'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList'
import categories from '@/features/azkar/data/categories.js'
import { ROUTES } from '@/app/router/routes'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const items = categories.map((category, index) => ({ ...category, id: index + 1 }))

export default function AzkarView() {
  return (
    <Page>
      <Heading title="الأذكار" subtitle="اختر الباب الذي ترغب في البحث عن الأذكار المتعلقة به" share />

      <SearchableFavoritesList
        items={items}
        itemKey="slug"
        favoritesKey={STORAGE_KEYS.azkarFavorites}
        placeholder="ابحث عن الباب"
        label="تبحث عن باب معين؟"
        favoritesTitle={<h5 className="mb-3">الأبواب المفضلة</h5>}
        allTitle={<h5 className="mb-3">كل الأبواب</h5>}
        renderItem={(item) => (
          <Link to={ROUTES.azkarCategory(item.slug)} className="stretched-link text-decoration-none text-reset">
            {toArabicNumerals(item.id)}. {item.name}
          </Link>
        )}
      />
    </Page>
  )
}
