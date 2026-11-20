import { readonly, ref } from 'vue'

// The visual viewport has to shrink by more than this before the keyboard counts as open.
const OPEN_THRESHOLD = 150

const open = ref(false)
let tallest = 0
let width = 0
let subscribed = false

export function measureKeyboard(viewport) {
  const scaledWidth = viewport.width * viewport.scale
  const height = viewport.height * viewport.scale

  // Rotating the phone changes the tallest height the viewport can reach.
  if (scaledWidth !== width) {
    width = scaledWidth
    tallest = 0
  }

  tallest = Math.max(tallest, height)
  open.value = tallest - height > OPEN_THRESHOLD
}

export function resetKeyboard() {
  open.value = false
  tallest = 0
  width = 0
}

/**
 * Whether the on-screen keyboard is open, judged by how far the visual viewport shrank below its tallest.
 * Fixed bottom bars hide while it is open, so they do not ride up over the field being typed in.
 */
export function useVirtualKeyboard() {
  const viewport = typeof window !== 'undefined' ? window.visualViewport : null

  if (viewport && !subscribed) {
    subscribed = true
    const update = () => measureKeyboard(viewport)
    update()
    viewport.addEventListener('resize', update)
  }

  return { open: readonly(open) }
}
