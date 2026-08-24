import { computed, ref } from 'vue'
import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// beforeinstallprompt fires once, early — capture it at module scope so the
// prompt is still available when the home view (or any consumer) mounts later.
const deferredPrompt = ref(null)

// useMediaQuery is SSR-safe by default; the navigator.standalone check covers
// iOS Safari, which does not report the standalone display-mode.
const isDisplayModeStandalone = useMediaQuery('(display-mode: standalone)')

const isStandalone = () =>
  isDisplayModeStandalone.value || (typeof window !== 'undefined' && window.navigator.standalone === true)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
  })
}

export function useInstallPrompt() {
  const dismissed = useLocalStorage(STORAGE_KEYS.installPromptDismissed, false)

  const canInstall = computed(() => !!deferredPrompt.value && !dismissed.value && !isStandalone())

  async function install() {
    const prompt = deferredPrompt.value
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    // The captured event is single-use either way.
    deferredPrompt.value = null
    if (outcome === 'dismissed') dismissed.value = true
  }

  function dismiss() {
    dismissed.value = true
  }

  return { canInstall, install, dismiss }
}
