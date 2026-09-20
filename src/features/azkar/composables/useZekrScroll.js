import { storeToRefs } from 'pinia'
import { useAppStore } from '@/app/stores/app'

const ZEKR_CARD_SELECTOR = '.zekr-card-root'

export function useZekrScroll(card) {
  const { zekrMoveNextOnComplete } = storeToRefs(useAppStore())

  function scrollToNextZekr() {
    if (!zekrMoveNextOnComplete.value) return

    let nextCard = card.value?.nextElementSibling
    while (nextCard?.matches?.(`${ZEKR_CARD_SELECTOR}.completed`)) {
      nextCard = nextCard.nextElementSibling
    }
    if (!nextCard?.matches?.(ZEKR_CARD_SELECTOR)) return

    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return { scrollToNextZekr }
}
