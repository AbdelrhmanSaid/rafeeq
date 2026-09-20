import { createApp, nextTick } from 'vue'

// iOS Safari can return a blank canvas above ~16.7M pixels.
const MAX_CANVAS_AREA = 16000000

// Downsample and require enough non-white pixels to reject failed rasterizations.
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
    // Let toDataURL report tainted canvases instead of calling them blank.
    return false
  }
}

export async function exportComponent(component, props = {}, filePrefix = 'export', options = {}) {
  const { canvas: canvasOptions = {}, format = 'png', quality = 0.92, expectedWidth } = options || {}

  // html2canvas-pro supports the theme's color() and color-mix() values.
  const { default: html2canvas } = await import('html2canvas-pro')

  // Fixed positioning avoids expanding the RTL document's scroll area.
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '-9999px'
  document.body.appendChild(container)

  const app = createApp(component, props)
  app.mount(container)

  try {
    await nextTick()
    await document.fonts.ready

    const element = container.firstChild

    // Stale service-worker CSS can delay the component reaching its expected width.
    if (expectedWidth) {
      const deadline = Date.now() + 3000
      while (Math.abs(element.clientWidth - expectedWidth) > 1) {
        if (Date.now() > deadline) {
          throw new Error(`Export component rendered at ${element.clientWidth}px instead of ${expectedWidth}px`)
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    const minimumWidth = 1080
    const actualWidth = element.clientWidth || 512
    const actualHeight = element.clientHeight || actualWidth

    // Long azkar must stay below the iOS canvas-area ceiling.
    const scale = Math.min(
      Math.max(minimumWidth / actualWidth, 1),
      Math.sqrt(MAX_CANVAS_AREA / (actualWidth * actualHeight)),
    )

    const defaultCanvasOptions = {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Avoid WebKit's clone-iframe scroll restoration race.
      scrollX: 0,
      scrollY: 0,
      ...canvasOptions,
    }

    // Retry once when font or clone timing produces a blank rasterization.
    let canvas = await html2canvas(element, defaultCanvasOptions)
    if (isCanvasBlank(canvas)) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      canvas = await html2canvas(element, defaultCanvasOptions)
    }

    if (isCanvasBlank(canvas)) throw new Error('Export produced a blank image')

    const mimesMap = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    }

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
