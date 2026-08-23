import { useRef } from 'react'
import { IconDownload, IconShare3, IconCopy, IconHeartShare, IconRestore } from '@tabler/icons-react'
import { toast } from 'sonner'

import ZekrImage from './ZekrImage'
import { useZekrScroll } from '@/features/azkar/hooks/useZekrScroll'
import { useZekrVibration } from '@/features/azkar/hooks/useZekrVibration'
import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useLongPress } from '@/shared/hooks/useLongPress'
import { exportElement } from '@/shared/utils/export'
import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './ZekrCard.module.scss'

// Counting targets: the counter button and the action menu handle their own
// clicks, so a tap anywhere else on the card counts instead.
const IGNORED_TARGETS = '[data-zekr-counter], [data-zekr-actions]'

export default function ZekrCard({ text, repeat = 1, reference, benefit, count = 0, onCountChange, className = '' }) {
  const cardRef = useRef(null)
  const isMobile = useIsMobile()
  const { vibrateOnFinish } = useZekrVibration()
  const { scrollToNextZekr } = useZekrScroll(cardRef)

  // A long press already counted, so the click it may emit afterwards must not.
  const longPressed = useRef(false)

  const increment = () => {
    if (count >= repeat) return

    const next = count + 1
    onCountChange?.(next)

    if (next === repeat) {
      vibrateOnFinish()
      scrollToNextZekr()
    }
  }

  const reset = () => {
    if (count > 0) onCountChange?.(0)
  }

  useLongPress(
    cardRef,
    (event) => {
      if (!isMobile || event.target.closest(IGNORED_TARGETS)) return
      longPressed.current = true
      increment()
    },
    // Mobile long presses often emit no click at all, so clear the flag shortly
    // after release in case none arrives.
    { onRelease: () => setTimeout(() => (longPressed.current = false), 100) },
  )

  const handleCardClick = () => {
    if (isMobile && !longPressed.current) increment()
    longPressed.current = false
  }

  const exportAsImage = () => {
    toast.promise(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return exportElement(<ZekrImage text={text} repeat={repeat} reference={reference} benefit={benefit} />, 'zekr')
      },
      {
        loading: 'جاري التصدير...',
        success: 'تم تصدير الصورة بنجاح',
        error: 'حدث خطأ أثناء تصدير الصورة',
      },
    )
  }

  const shareZekr = () => {
    toast.promise(() => navigator.share({ title: 'رفيق', text }), {
      loading: 'جاري المشاركة...',
      success: 'تم مشاركة الذكر بنجاح',
      error: 'حدث خطأ أثناء مشاركة الذكر',
    })
  }

  const copyZekr = () => {
    toast.promise(() => navigator.clipboard.writeText(text), {
      loading: 'جاري النسخ...',
      success: 'تم نسخ الذكر بنجاح',
      error: 'حدث خطأ أثناء نسخ الذكر',
    })
  }

  return (
    <div
      ref={cardRef}
      data-zekr-card
      className={`${styles.card} border rounded p-4 ${className}`}
      onClick={handleCardClick}
    >
      <div data-zekr-actions className={`${styles.actions} dropdown`} onClick={(event) => event.stopPropagation()}>
        <button className="btn p-0 bg-transparent" type="button" data-bs-toggle="dropdown" aria-label="خيارات الذكر">
          <IconHeartShare size="18" />
        </button>

        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2" onClick={exportAsImage}>
              <IconDownload size="18" />
              <span>تنزيل</span>
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2" onClick={shareZekr}>
              <IconShare3 size="18" />
              <span>مشاركة</span>
            </button>
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2" onClick={copyZekr}>
              <IconCopy size="18" />
              <span>نسخ</span>
            </button>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button className="dropdown-item d-flex align-items-center gap-2" disabled={count === 0} onClick={reset}>
              <IconRestore size="18" />
              <span>تصفير</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="row align-items-center g-4 text-center text-lg-start">
        <div className="col-12 col-lg-auto">
          <button
            data-zekr-counter
            aria-label="عداد الذكر"
            className={`btn ${styles.counter} border-flat`}
            onClick={(event) => {
              event.stopPropagation()
              increment()
            }}
            style={{ '--progress': count / repeat }}
            data-content={toArabicNumerals(`${count}/${repeat}`)}
          ></button>
        </div>

        <div className="col-12 col-lg">
          <p className={`${styles.text} font-quran m-0`}>{text}</p>

          {(benefit || reference) && (
            <p className="text-muted m-0 pe-2">
              {reference && <small>{reference}</small>}
              {benefit && reference && <small> - </small>}
              {benefit && <small>{benefit}</small>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
