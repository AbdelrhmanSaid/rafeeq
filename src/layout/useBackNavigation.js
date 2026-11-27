import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useBackNavigation() {
  const route = useRoute()
  const router = useRouter()

  const parent = computed(() => route.meta.parent)

  function goBack() {
    // A deep link has no history entry to go back to.
    if (window.history.state?.back) {
      router.back()
    } else {
      router.push({ name: parent.value })
    }
  }

  return { parent, goBack }
}
