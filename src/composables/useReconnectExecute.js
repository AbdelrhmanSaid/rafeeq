import { ref, watch } from 'vue'

export function useReconnectExecute(onlineRef, execute) {
  const isRecoveringOnReconnect = ref(false)

  watch(onlineRef, async (isOnline, wasOnline) => {
    if (!isOnline || wasOnline === undefined || isOnline === wasOnline) return

    isRecoveringOnReconnect.value = true
    try {
      await execute()
    } catch (error) {
      // A failed re-fetch on reconnect shouldn't surface as an unhandled
      // rejection; callers can observe failures through their own state.
      console.error('Reconnect execute failed:', error)
    } finally {
      isRecoveringOnReconnect.value = false
    }
  })

  return { isRecoveringOnReconnect }
}
