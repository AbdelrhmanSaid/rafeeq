import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useRadioStore } from '@/features/radio/store'
import { toArabicNumerals } from '@/shared/utils/arabic'

// Surfaces radio reconnect feedback. Mounted once at the app shell so toasts
// fire regardless of the current route.
export function useRadioNotifications() {
  const retryCount = useRadioStore((state) => state.retryCount)
  const status = useRadioStore((state) => state.status)
  const previousStatus = useRef(status)

  useEffect(() => {
    if (retryCount > 0) toast.info(`تعذر تشغيل الإذاعة، جارٍ إعادة الاتصال... (${toArabicNumerals(retryCount)}/٣)`)
  }, [retryCount])

  useEffect(() => {
    const previous = previousStatus.current
    previousStatus.current = status

    if (status === 'failed') toast.error('تعذر تشغيل الإذاعة، حاول مرة أخرى لاحقاً.')
    else if (status === 'playing' && previous === 'retrying') toast.success('تم استعادة الاتصال بالإذاعة')
  }, [status])
}
