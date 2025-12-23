const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

let trackerPromise

const isBrowser = typeof window !== 'undefined'

const loadTracker = () => {
  if (trackerPromise || !isBrowser || !measurementId) return trackerPromise

  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)

  if (existingScript && typeof window.gtag === 'function') {
    trackerPromise = Promise.resolve(window.gtag)
    return trackerPromise
  }

  trackerPromise = new Promise((resolve) => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', measurementId)

    // Load the gtag.js script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.async = true
    script.onload = () => resolve(window.gtag)
    script.onerror = () => resolve(undefined)

    document.head.appendChild(script)
  })

  return trackerPromise
}

export const trackPageview = (path) => {
  const tracker = loadTracker()

  tracker?.then((gtag) => {
    if (!gtag) return

    const url = path ? new URL(path, window.location.origin).toString() : window.location.href

    gtag('event', 'page_view', {
      page_path: path || window.location.pathname,
      page_location: url,
    })
  })
}

export const enableAutoAnalytics = () => {
  loadTracker()
}
