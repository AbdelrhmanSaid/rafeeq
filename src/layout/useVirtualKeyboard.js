import { readonly, ref } from 'vue'

const OPEN_THRESHOLD = 150

const open = ref(false)
let tallest = 0
let width = 0
let subscribed = false

export function measureKeyboard(viewport) {
  const scaledWidth = viewport.width * viewport.scale
  const height = viewport.height * viewport.scale

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
