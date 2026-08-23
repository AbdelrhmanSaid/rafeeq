import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import PrayerTimes from '@/features/prayers/components/PrayerTimes'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers'
import RandomAyah from '@/features/quran/components/RandomAyah'
import QuickAzkar from '@/features/azkar/components/QuickAzkar'
import { usePrayerLayout } from '@/features/prayers/hooks/usePrayerLayout'

export default function HomeView() {
  const vertical = usePrayerLayout()

  return (
    <Page>
      <h1 className="visually-hidden">رفيق — الرئيسية</h1>

      <Heading size={2} className="mb-4" title="مواقيت الصلاة" subtitle="إن الصلاة كانت على المؤمنين كتابا موقوتا." />
      <PrayerTimes className="mb-5" vertical={vertical} />

      <Heading size={2} className="mb-4" title="السنن الرواتب" subtitle="وما يزال عبدي يتقرب إلي بالنوافل حتى أحبه." />
      <SunnahPrayers className="mb-5" />

      <Heading size={2} className="mb-4" title="آية من القرآن" subtitle="وننزل من القرآن ما هو شفاء ورحمة للمؤمنين." />
      <RandomAyah className="mb-5" />

      <Heading size={2} className="mb-4" title="الأذكار" subtitle="لا يزال لسانك رطباً من ذكر الله." />
      <QuickAzkar />
    </Page>
  )
}
