import { useParams, useSearchParams } from 'react-router-dom'
import { IconAlertTriangle } from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'
import ErrorState from '@/shared/ui/ErrorState'
import PrayerTimes from '@/features/prayers/components/PrayerTimes'
import SunnahPrayers from '@/features/prayers/components/SunnahPrayers'
import Sebha from '@/features/sebha/components/Sebha'
import RandomAyah from '@/features/quran/components/RandomAyah'

// Props every embed accepts, on top of whatever its component declares.
const HEADING_SCHEMA = {
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
}

const EMBEDS = {
  'prayer-times': {
    component: PrayerTimes,
    schema: {
      lat: { type: Number, default: null },
      long: { type: Number, default: null },
      vertical: { type: Boolean, default: false },
    },
  },
  'sunnah-prayers': { component: SunnahPrayers },
  'sebha': { component: Sebha },
  'random-ayah': { component: RandomAyah },
}

// Query strings are all text, so each embed declares the type it expects.
function resolveProps(schema, query) {
  const props = {}

  for (const [key, { type, default: defaultValue }] of Object.entries(schema)) {
    const raw = query.get(key)

    if (raw == null) props[key] = defaultValue
    else if (type === Number) props[key] = Number(raw)
    else if (type === Boolean) props[key] = raw !== 'false' && raw !== '0'
    else props[key] = raw
  }

  return props
}

export default function EmbedComponentView() {
  const { component } = useParams()
  const [searchParams] = useSearchParams()

  const embed = EMBEDS[component]

  if (!embed) {
    return (
      <Page>
        <ErrorState icon={IconAlertTriangle} message="خطأ في الإعدادات: المكوّن غير موجود." />
      </Page>
    )
  }

  const { title, subtitle } = resolveProps(HEADING_SCHEMA, searchParams)
  const EmbeddedComponent = embed.component
  const componentProps = resolveProps(embed.schema ?? {}, searchParams)

  return (
    <Page>
      {title && <Heading size={2} className="mb-4" title={title} subtitle={subtitle} />}
      <EmbeddedComponent {...componentProps} />
    </Page>
  )
}
