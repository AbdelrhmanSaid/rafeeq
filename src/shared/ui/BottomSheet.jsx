import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { usePresence } from '@/shared/hooks/usePresence'
import styles from './BottomSheet.module.scss'

export default function BottomSheet({ show = false, title = '', onClose, children }) {
  const { isMounted, isVisible } = usePresence(show)

  // Lock the background page scroll while the sheet is open so the backdrop
  // stays put instead of scrolling behind the panel.
  useEffect(() => {
    if (!show) return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [show])

  if (!isMounted) return null

  return createPortal(
    <div
      className={`position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-end ${styles.overlay} ${isVisible ? styles.visible : ''}`}
      onClick={onClose}
    >
      <div className={`bg-body rounded-top-3 ${styles.sheet}`} onClick={(event) => event.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 className="mb-0">{title}</h5>
          <button className="btn btn-sm" onClick={onClose} aria-label="إغلاق">
            <IconX size="1.25rem" />
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
