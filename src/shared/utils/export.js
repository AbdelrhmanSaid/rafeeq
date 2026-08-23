import { createApp, nextTick } from 'vue'
// html2canvas-pro, not html2canvas: the original can't parse the color() /
// color-mix() values the theme now computes to, and dies before capturing.
import html2canvas from 'html2canvas-pro'

/**
 * Export a Vue component as an image
 * @param {Object} component - Vue component to render
 * @param {Object} props - Props to pass to the component
 * @param {string} filePrefix - Optional prefix for the downloaded file (default: 'export')
 * @param {Object} options - Optional configuration
 * @param {Object} options.canvas - html2canvas options
 * @param {string} options.format - Image format ('png' | 'jpeg' | 'webp', default: 'png')
 * @param {number} options.quality - Image quality for jpeg/webp (0-1, default: 0.92)
 */
export async function exportComponent(component, props = {}, filePrefix = 'export', options = {}) {
  const { canvas: canvasOptions = {}, format = 'png', quality = 0.92 } = options || {}

  try {
    // Create temporary container. Must be absolute, not fixed: html2canvas
    // crops at getBoundingClientRect() + page scroll offset, and a fixed
    // element's rect doesn't move with scroll — so with the page scrolled the
    // crop landed below the card and exported a blank white image. An absolute
    // element at the document top keeps rect + scroll constant at (−9999, 0).
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    // Create and mount Vue app
    const app = createApp(component, props)
    app.mount(container)

    // Wait for component to render, and for webfonts so the first export
    // after page load doesn't rasterize with the fallback font
    await nextTick()
    await document.fonts.ready

    const minimumWidth = 1080 // 1080px is the minimum width for the image
    const actualWidth = container.firstChild.clientWidth

    // Default html2canvas options
    const defaultCanvasOptions = {
      backgroundColor: '#ffffff',
      scale: Math.max(minimumWidth / actualWidth, 1),
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Render the cloned document unscrolled: with the container anchored at
      // the document top, page scroll must not shift the capture region
      scrollX: 0,
      scrollY: 0,
      ...canvasOptions,
    }

    // Capture the component
    const canvas = await html2canvas(container.firstChild, defaultCanvasOptions)

    // Cleanup
    app.unmount()
    document.body.removeChild(container)

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
  }
}
