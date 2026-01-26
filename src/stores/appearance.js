import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

const DEFAULT_FONT_SIZE = 16
const MIN_FONT_SIZE = 14
const MAX_FONT_SIZE = 20

const clampFontSize = (value) =>
  Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Number.parseInt(value, 10) || DEFAULT_FONT_SIZE))

export const useAppearanceStore = defineStore('appearance', () => {
  const fontSize = ref(clampFontSize(localStorage.getItem('app-font-size')))

  function setFontSize(value) {
    fontSize.value = clampFontSize(value)
    localStorage.setItem('app-font-size', fontSize.value)
  }

  watchEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize.value}px`)
  })

  return {
    fontSize,
    setFontSize,
    minFontSize: MIN_FONT_SIZE,
    maxFontSize: MAX_FONT_SIZE,
  }
})
