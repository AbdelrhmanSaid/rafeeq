import { registerSW } from 'virtual:pwa-register'
import { toast } from 'sonner'

import { useAppStore } from '@/app/stores/app'
import { isEmbedPath } from '@/app/router/routes'

// Guard against reload loops: a service worker update may only ever trigger a
// single automatic reload per page load. Without this, a churning/competing
// service worker registration can re-fire onNeedRefresh and reload the app
// on every visit a second or two after it opens.
let hasReloadedForUpdate = false

export function registerServiceWorker() {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (isEmbedPath(window.location.pathname) || useAppStore.getState().autoUpdateServiceWorker) {
        if (hasReloadedForUpdate) return
        hasReloadedForUpdate = true
        updateSW(true)
        return
      }

      toast('يتوفر تحديث جديد للتطبيق.', {
        action: {
          label: 'تحديث الآن',
          onClick: () => updateSW(true),
        },
        duration: Infinity,
      })
    },
  })
}
