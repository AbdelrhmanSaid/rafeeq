import { computed, ref } from 'vue'
import { useLocalStorage, useMediaQuery } from '@vueuse/core'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

// Capture the one-shot event before consumers mount.
const deferredPrompt = ref(null)

// iOS Safari exposes standalone mode only through navigator.standalone.
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
    deferredPrompt.value = null
    if (outcome === 'dismissed') dismissed.value = true
  }

  function dismiss() {
    dismissed.value = true
  }

  return { canInstall, install, dismiss }
}
