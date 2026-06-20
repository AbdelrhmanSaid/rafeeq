import { ref } from 'vue'

// Runs an async fetcher and tracks its lifecycle. Pairs with <AsyncContent>.
export function useAsyncData(fetcher, { immediate = true } = {}) {
  const data = ref(null)
  const error = ref(null)
  const pending = ref(false)

  async function execute() {
    pending.value = true
    error.value = null

    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  if (immediate) execute()

  return { data, error, pending, execute }
}
