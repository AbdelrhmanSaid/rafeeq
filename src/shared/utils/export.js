import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import html2canvas from 'html2canvas'

/**
 * Render a React element off-screen and download it as an image.
 *
 * @param {React.ReactElement} element - element to rasterize
 * @param {string} filePrefix - prefix for the downloaded file (default: 'export')
 * @param {Object} options - optional configuration
 * @param {Object} options.canvas - html2canvas options
 * @param {string} options.format - image format ('png' | 'jpeg' | 'webp', default: 'png')
 * @param {number} options.quality - image quality for jpeg/webp (0-1, default: 0.92)
 */
export async function exportElement(element, filePrefix = 'export', options = {}) {
  const { canvas: canvasOptions = {}, format = 'png', quality = 0.92 } = options || {}

  // Off-screen container: rendered for real (so fonts and layout apply) but
  // never visible to the user.
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '-9999px'
  container.style.left = '-9999px'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    flushSync(() => root.render(element))

    const target = container.firstElementChild
    if (!target) throw new Error('Nothing was rendered for export')

    const minimumWidth = 1080 // 1080px is the minimum width for the image
    const canvas = await html2canvas(target, {
      backgroundColor: '#ffffff',
      scale: Math.max(minimumWidth / target.clientWidth, 1),
      useCORS: true,
      allowTaint: true,
      logging: false,
      ...canvasOptions,
    })

    const mimeTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    }

    const link = document.createElement('a')
    link.download = `${filePrefix}-${Date.now()}.${format}`
    link.href = canvas.toDataURL(mimeTypes[format] || mimeTypes.png, quality)
    document.body.appendChild(link)
    link.click()
    link.remove()

    return true
  } catch (error) {
    console.error('Error exporting element:', error)
    throw error
  } finally {
    root.unmount()
    container.remove()
  }
}
