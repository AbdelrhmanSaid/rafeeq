import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'

const ZEKR_CARD_SELECTOR = '.zekr-card-root'

// Smooth movement between azkar, gated by the user's app settings.
export function useZekrScroll(card) {
  const { zekrMoveNextOnComplete } = storeToRefs(useAppStore())

  function scrollToNextZekr() {
    if (!zekrMoveNextOnComplete.value) return

    // Walk forward to the next *incomplete* zekr card, skipping finished ones.
    let nextCard = card.value?.nextElementSibling
    while (nextCard?.matches?.(`${ZEKR_CARD_SELECTOR}.completed`)) {
      nextCard = nextCard.nextElementSibling
    }
    if (!nextCard?.matches?.(ZEKR_CARD_SELECTOR)) return

    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return { scrollToNextZekr }
}
