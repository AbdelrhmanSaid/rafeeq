import { createApp, nextTick } from 'vue'
// html2canvas-pro, not html2canvas: the original can't parse the color() /
// color-mix() values the theme now computes to, and dies before capturing.
import html2canvas from 'html2canvas-pro'

// iOS Safari silently produces an all-blank canvas (no error) once a canvas
// exceeds ~16.7M pixels — the classic "exported a white image" failure.
// Keep a safety margin below that.
const MAX_CANVAS_AREA = 16000000

/**
 * A real export is mostly ink: the card fills the frame with an off-white
 * (#fffdf9) ground plus dark text, so nearly every pixel sits below pure
 * white. A failed rasterization is the inverse — a white canvas with at most
 * a stray ornament — so require a meaningful share of non-white pixels
 * rather than hunting for a single dark one (a lone surviving logo used to
 * sneak past that). Downsample into a probe canvas to keep the scan cheap.
 */
function isCanvasBlank(canvas) {
  if (!canvas || !canvas.width || !canvas.height) return true

  try {
    const probe = document.createElement('canvas')
    probe.width = 64
    probe.height = 64
    const ctx = probe.getContext('2d', { willReadFrequently: true })
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 64, 64)
    ctx.drawImage(canvas, 0, 0, 64, 64)

    const data = ctx.getImageData(0, 0, 64, 64).data
    let content = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) content++
    }
    return content / (data.length / 4) < 0.005
  } catch {
    // Reading pixels can throw (e.g. tainted canvas) — let toDataURL be the
    // one to surface that error instead of misreporting a blank export.
    return false
  }
}

/**
 * Export a Vue component as an image
 * @param {Object} component - Vue component to render
 * @param {Object} props - Props to pass to the component
 * @param {string} filePrefix - Optional prefix for the downloaded file (default: 'export')
 * @param {Object} options - Optional configuration
 * @param {Object} options.canvas - html2canvas options
 * @param {string} options.format - Image format ('png' | 'jpeg' | 'webp', default: 'png')
 * @param {number} options.quality - Image quality for jpeg/webp (0-1, default: 0.92)
 * @param {number} options.expectedWidth - Sanity width (px) the mounted component must reach before capture
 */
export async function exportComponent(component, props = {}, filePrefix = 'export', options = {}) {
  const { canvas: canvasOptions = {}, format = 'png', quality = 0.92, expectedWidth } = options || {}

  // Create temporary container. Keep it position: fixed — fixed boxes never
  // contribute to scrollable overflow, while an absolute box hanging off the
  // left edge expands the scroll area in this RTL document and flashes a
  // horizontal scrollbar during every export.
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-9999px'
  document.body.appendChild(container)

  // Create and mount Vue app
  const app = createApp(component, props)
  app.mount(container)

  try {
    // Wait for the component to render, and for webfonts so a capture right
    // after page load doesn't rasterize with the fallback font
    await nextTick()
    await document.fonts.ready

    const element = container.firstChild

    // A component that hasn't reached its designed width rendered without its
    // styles (e.g. a stale service-worker update left the app with CSS whose
    // scoped hashes no longer match) — capturing it would export garbage, so
    // give late styles a moment to apply, then fail into the error toast.
    if (expectedWidth) {
      const deadline = Date.now() + 3000
      while (Math.abs(element.clientWidth - expectedWidth) > 1) {
        if (Date.now() > deadline) {
          throw new Error(`Export component rendered at ${element.clientWidth}px instead of ${expectedWidth}px`)
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    const minimumWidth = 1080 // 1080px is the minimum width for the image
    const actualWidth = element.clientWidth || 512
    const actualHeight = element.clientHeight || actualWidth

    // Upscale to the minimum width, but never past the canvas-area ceiling —
    // very long azkar would otherwise cross it and export blank on iOS
    const scale = Math.min(
      Math.max(minimumWidth / actualWidth, 1),
      Math.sqrt(MAX_CANVAS_AREA / (actualWidth * actualHeight)),
    )

    // Default html2canvas options
    const defaultCanvasOptions = {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Capture as if the page were unscrolled: the card is position: fixed so
      // its geometry can't change, and this turns the clone iframe's
      // scroll-restore (a known WebKit race that yields blank captures when
      // the page is scrolled) into a no-op.
      scrollX: 0,
      scrollY: 0,
      ...canvasOptions,
    }

    // Capture the component; a blank first pass is a rasterization failure
    // (fonts/clone timing), so give it one more paint cycle and try again
    let canvas = await html2canvas(element, defaultCanvasOptions)
    if (isCanvasBlank(canvas)) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      canvas = await html2canvas(element, defaultCanvasOptions)
    }

    // Fail loudly instead of downloading a white image
    if (isCanvasBlank(canvas)) throw new Error('Export produced a blank image')

    const mimesMap = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    }

    // Generate download
    const mimeType = mimesMap[format] || mimesMap.png
    const dataUrl = canvas.toDataURL(mimeType, quality)

    const link = document.createElement('a')
    link.download = `${filePrefix}-${Date.now()}.${format}`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  } catch (error) {
    console.error('Error exporting component:', error)
    throw error
  } finally {
    app.unmount()
    document.body.removeChild(container)
  }
}
