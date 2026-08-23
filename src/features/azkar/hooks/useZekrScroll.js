import { useCallback } from 'react'
import { useAppStore } from '@/app/stores/app'

const ZEKR_CARD_SELECTOR = '[data-zekr-card]'

// Smooth movement between azkar, gated by the user's app settings.
export function useZekrScroll(cardRef) {
  const moveNextOnComplete = useAppStore((state) => state.zekrMoveNextOnComplete)

  const scrollToNextZekr = useCallback(() => {
    if (!moveNextOnComplete) return

    const nextCard = cardRef.current?.nextElementSibling
    if (!nextCard?.matches?.(ZEKR_CARD_SELECTOR)) return

    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [cardRef, moveNextOnComplete])

  return { scrollToNextZekr }
}
