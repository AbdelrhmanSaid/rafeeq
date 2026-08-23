import { useCallback } from 'react'
import { toast } from 'sonner'
import { usePrayersStore } from '@/features/prayers/store'

const GEO_ERROR_MESSAGES = {
  1: 'تم رفض إذن الوصول للموقع. يمكنك تفعيله من إعدادات المتصفح.',
  2: 'الموقع غير متاح حالياً. يمكنك المحاولة مرة أخرى.',
  3: 'فشل في تحديد الموقع. يمكنك المحاولة مرة أخرى.',
}
const GEO_ERROR_FALLBACK = 'حدث خطأ أثناء تحديد الموقع. يمكنك المحاولة مرة أخرى.'

// Triggers location detection and surfaces the result to the user.
export function usePrayerLocation() {
  const detectLocation = usePrayersStore((state) => state.detect)

  const detect = useCallback(async () => {
    const result = await detectLocation()

    if (result.ok) toast.success('تم تحديد الموقع بنجاح.')
    else toast.error(GEO_ERROR_MESSAGES[result.code] || GEO_ERROR_FALLBACK)

    return result
  }, [detectLocation])

  return { detect }
}
