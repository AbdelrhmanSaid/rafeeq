import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { IconWifiOff } from '@tabler/icons-react'
import { Toaster } from 'sonner'

import Navbar from '@/layout/Navbar'
import Footer from '@/layout/Footer'
import TabBar from '@/layout/TabBar'
import { isEmbedPath } from '@/app/router/routes'
import { useRouteEffects } from '@/app/router/useRouteEffects'
import { useApplyTheme, useResolvedThemeMode } from '@/app/stores/theme'
import { useRadioNotifications } from '@/features/radio/hooks/useRadioNotifications'
import { useOnline } from '@/shared/hooks/useOnline'

// The app shell: chrome around the routed page, plus the effects that have to
// run for every route.
export default function App() {
  const online = useOnline()
  const isEmbed = isEmbedPath(useLocation().pathname)
  const themeMode = useResolvedThemeMode()

  useApplyTheme()
  useRouteEffects()
  useRadioNotifications()

  const [showOfflineBanner, setShowOfflineBanner] = useState(true)

  // Offer the banner again the next time the connection drops.
  useEffect(() => {
    const restoreBanner = () => setShowOfflineBanner(true)

    window.addEventListener('online', restoreBanner)
    return () => window.removeEventListener('online', restoreBanner)
  }, [])

  return (
    <>
      <div className={`app-shell ${isEmbed ? 'main-content-embed' : ''}`}>
        {!online && showOfflineBanner && (
          <div className="offline-banner">
            <div className="container">
              <div className="d-flex align-items-center text-white">
                <IconWifiOff className="me-2" size="1.25rem" />
                <span>لا يوجد اتصال بالإنترنت</span>

                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  aria-label="Close"
                  onClick={() => setShowOfflineBanner(false)}
                ></button>
              </div>
            </div>
          </div>
        )}

        {!isEmbed && <Navbar className="d-none d-md-block" />}

        <div className="main-content">
          <Outlet />
        </div>

        {!isEmbed && <Footer className="d-none d-md-block" />}

        {!isEmbed && <TabBar className="d-block d-md-none" />}
      </div>

      <ScrollRestoration />

      <Toaster
        theme={themeMode}
        position="bottom-left"
        offset="20px"
        toastOptions={{
          style: {
            gap: '20px',
            fontFamily: 'Thmanyah Sans, sans-serif',
          },
        }}
      />
    </>
  )
}
