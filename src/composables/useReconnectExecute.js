import { ref, watch } from 'vue'

export function useReconnectExecute(onlineRef, execute) {
  const isRecoveringOnReconnect = ref(false)

  watch(onlineRef, async (isOnline, wasOnline) => {
    if (!isOnline || wasOnline === undefined || isOnline === wasOnline) return

    isRecoveringOnReconnect.value = true
    try {
      await execute()
    } finally {
      isRecoveringOnReconnect.value = false
    }
  })

  return { isRecoveringOnReconnect }
}
