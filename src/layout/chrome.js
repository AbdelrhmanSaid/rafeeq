import { onBeforeUnmount, onMounted, reactive } from 'vue'

// Full-screen readers draw under the app bar and tab bar, which float over them and can be tucked away with a tap.
export const chrome = reactive({
  overlay: false,
  hidden: false,
})

export function useImmersiveChrome() {
  onMounted(() => {
    chrome.overlay = true
    chrome.hidden = false
    document.documentElement.classList.add('is-immersive')
  })

  onBeforeUnmount(() => {
    chrome.overlay = false
    chrome.hidden = false
    document.documentElement.classList.remove('is-immersive')
  })

  return {
    toggle: () => (chrome.hidden = !chrome.hidden),
  }
}
