import { watch } from 'vue'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { useRadioStore } from '@/features/radio/store'

// Surfaces radio reconnect feedback. Mounted once at the app shell so toasts
// fire regardless of the current route.
export function useRadioNotifications() {
  const radio = useRadioStore()

  watch(
    () => radio.retryCount,
    (count) => {
      if (count > 0) {
        toast.info(`تعذر تشغيل الإذاعة، جارٍ إعادة الاتصال... (${toArabicNumerals(count)}/٣)`)
      }
    },
  )

  watch(
    () => radio.status,
    (now, prev) => {
      if (now === 'failed') {
        toast.error('تعذر تشغيل الإذاعة، حاول مرة أخرى لاحقاً.')
      } else if (now === 'playing' && prev === 'retrying') {
        toast.success('تم استعادة الاتصال بالإذاعة')
      }
    },
  )
}
