import { createApp, nextTick } from 'vue'
import html2canvas from 'html2canvas'

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
    // Create temporary container
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    // Create and mount Vue app
    const app = createApp(component, props)
    app.mount(container)

    // Wait for component to render
    await nextTick()

    const minimumWidth = 1080 // 1080px is the minimum width for the image
    const actualWidth = container.firstChild.clientWidth

    // Default html2canvas options
    const defaultCanvasOptions = {
      backgroundColor: '#ffffff',
      scale: Math.max(minimumWidth / actualWidth, 1),
      useCORS: true,
      allowTaint: true,
      logging: false,
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
