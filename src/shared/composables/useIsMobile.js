import { useMediaQuery } from '@vueuse/core'

export function useIsMobile() {
  return useMediaQuery('(max-width: 991.98px)')
}
