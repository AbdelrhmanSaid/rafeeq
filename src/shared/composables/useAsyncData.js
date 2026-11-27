import { ref } from 'vue'

export function useAsyncData(fetcher) {
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

  execute()

  return { data, error, pending, execute }
}
