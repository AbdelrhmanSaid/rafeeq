import { usePrayersStore } from '@/features/prayers/store'
import { useIsMobile } from '@/shared/hooks/useIsMobile'

// Effective orientation of <PrayerTimes>: the stored preference, or the one
// that fits the viewport when it is left on 'auto'.
export function usePrayerLayout() {
  const layout = usePrayersStore((state) => state.layout)
  const isCompactViewport = useIsMobile()

  if (layout === 'list') return true
  if (layout === 'cards') return false

  return isCompactViewport
}
