import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Detail screens name their parent in `meta.parent`; the shell shows a back button for them.
export function useBackNavigation() {
  const route = useRoute()
  const router = useRouter()

  const parent = computed(() => route.meta.parent)

  function goBack() {
    // Deep links have nowhere to go back to, so step up to the parent screen instead of leaving the app.
    if (window.history.state?.back) {
      router.back()
    } else {
      router.push({ name: parent.value })
    }
  }

  return { parent, goBack }
}
