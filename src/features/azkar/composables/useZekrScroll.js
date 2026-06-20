import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'

const ZEKR_CARD_SELECTOR = '.zekr-card'

// Smooth movement between azkar, gated by the user's app settings.
export function useZekrScroll(card) {
  const { zekrMoveNextOnComplete } = storeToRefs(useAppStore())

  function scrollToNextZekr() {
    if (!zekrMoveNextOnComplete.value) return

    const nextCard = card.value?.nextElementSibling
    if (!nextCard?.matches?.(ZEKR_CARD_SELECTOR)) return

    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return { scrollToNextZekr }
}
