import { useEffect } from 'react'
import { useLocation, useMatches, useNavigation } from 'react-router-dom'
import nProgress from 'nprogress'

import { isEmbedPath } from '@/app/router/routes'
import { useThemeStore } from '@/app/stores/theme'
import { trackPageview } from '@/shared/utils/analytics'
import { setMeta } from '@/shared/utils/head'

// Everything the app does on navigation: the progress bar, page meta, the
// analytics pageview, embed theming, and dismissing the mobile menu.
export function useRouteEffects() {
  const location = useLocation()
  const navigation = useNavigation()
  const matches = useMatches()

  const { pathname, search } = location
  const isEmbed = isEmbedPath(pathname)

  // Views that resolve their own meta (a surah, a zekr category, a station)
  // declare none here and call usePageMeta() instead.
  const routeMeta = matches[matches.length - 1]?.handle?.meta

  useEffect(() => {
    if (isEmbed) return

    if (navigation.state === 'loading') nProgress.start()
    else nProgress.done()
  }, [navigation.state, isEmbed])

  useEffect(() => {
    if (routeMeta) setMeta(routeMeta)
  }, [routeMeta])

  useEffect(() => {
    const { applyQueryOverrides, clearQueryOverrides } = useThemeStore.getState()

    if (isEmbed) applyQueryOverrides(Object.fromEntries(new URLSearchParams(search)))
    else clearQueryOverrides()
  }, [isEmbed, search])

  useEffect(() => {
    // Close the mobile menu after clicking on a link.
    document.querySelector('.navbar-collapse')?.classList?.remove('show')

    // Send a pageview to analytics without blocking navigation.
    trackPageview(`${pathname}${search}`)
  }, [pathname, search])
}
