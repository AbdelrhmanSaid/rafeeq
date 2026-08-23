import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { usePresence } from '@/shared/hooks/usePresence'
import styles from './BottomSheet.module.scss'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const focusableIn = (root) =>
  [...root.querySelectorAll(FOCUSABLE)].filter((element) => !element.closest('[hidden], [aria-hidden="true"]'))

// A modal sheet: traps Tab within the panel, closes on Escape, moves focus in
// when it opens and gives it back to the opener when it closes.
export default function BottomSheet({ show = false, title = '', onClose, children }) {
  const { isMounted, isVisible } = usePresence(show)
  const titleId = useId()
  const sheetRef = useRef(null)
  const bodyRef = useRef(null)
  const openerRef = useRef(null)

  // Lock the background page scroll while the sheet is open so the backdrop
  // stays put instead of scrolling behind the panel.
  useEffect(() => {
    if (!show) return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [show])

  // Focus management: remember the opener, focus the first control (or the
  // panel itself), and restore focus on close.
  useEffect(() => {
    if (!show) return

    openerRef.current = document.activeElement
    const sheet = sheetRef.current
    if (!sheet) return

    // Prefer the first control in the body over the close button.
    const body = bodyRef.current
    const [first] = body && focusableIn(body).length ? focusableIn(body) : focusableIn(sheet)
    ;(first ?? sheet).focus({ preventScroll: true })

    return () => {
      const opener = openerRef.current
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
        opener.focus({ preventScroll: true })
      }
    }
  }, [show])

  useEffect(() => {
    if (!show) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key !== 'Tab' || !sheetRef.current) return

      const focusable = focusableIn(sheetRef.current)
      if (focusable.length === 0) {
        event.preventDefault()
        sheetRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = sheetRef.current.contains(active)

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [show, onClose])

  if (!isMounted) return null

  return createPortal(
    <div
      className={`position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-end ${styles.overlay} ${isVisible ? styles.visible : ''}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`bg-body rounded-top-3 ${styles.sheet}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 id={titleId} className="mb-0">
            {title}
          </h5>
          <button type="button" className="btn btn-sm" onClick={onClose} aria-label="إغلاق">
            <IconX size="1.25rem" />
          </button>
        </div>

        <div ref={bodyRef} className={styles.body}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
