import { useMediaQuery } from '@vueuse/core'

// Phone/tablet viewports — below Bootstrap's lg breakpoint.
export function useIsMobile() {
  return useMediaQuery('(max-width: 991.98px)')
}
