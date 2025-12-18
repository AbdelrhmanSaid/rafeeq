const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://analytics.umami.is/script.js'

let trackerPromise

const isBrowser = typeof window !== 'undefined'

const loadTracker = () => {
  if (trackerPromise || !isBrowser || !websiteId) return trackerPromise

  const existingScript = document.querySelector(
    `script[data-website-id="${websiteId}"][data-analytics-provider="umami"]`
  )

  if (existingScript?.dataset.loaded === 'true') {
    trackerPromise = Promise.resolve(window.umami)
    return trackerPromise
  }

  trackerPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.defer = true
    script.dataset.websiteId = websiteId
    script.dataset.analyticsProvider = 'umami'
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve(window.umami)
    }
    script.onerror = () => resolve(undefined)

    document.body.appendChild(script)
  })

  return trackerPromise
}

export const trackPageview = (path) => {
  const tracker = loadTracker()

  tracker?.then((umami) => {
    if (!umami) return

    const url = path ? new URL(path, window.location.origin).toString() : window.location.href

    if (typeof umami.trackView === 'function') {
      umami.trackView(url, document.referrer)
    } else if (typeof umami === 'function') {
      umami('pageview', { url })
    }
  })
}

export const enableAutoAnalytics = () => {
  loadTracker()
}
