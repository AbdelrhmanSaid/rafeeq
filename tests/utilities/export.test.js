import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h } from 'vue'

const toDataURL = vi.fn(() => 'data:image/png;base64,AAA')
const html2canvas = vi.fn(async () => ({ toDataURL }))

vi.mock('html2canvas', () => ({ default: html2canvas }))

// Imported after the mock is registered.
const { exportComponent } = await import('@/utilities/export')

const Dummy = defineComponent({
  render() {
    return h('div', { class: 'dummy' }, 'content')
  },
})

let clickSpy

beforeEach(() => {
  html2canvas.mockClear()
  toDataURL.mockClear()
  clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  clickSpy.mockRestore()
})

describe('exportComponent', () => {
  it('renders the component, captures it, and triggers a download', async () => {
    const result = await exportComponent(Dummy, {}, 'zekr')

    expect(result).toBe(true)
    expect(html2canvas).toHaveBeenCalledOnce()
    expect(toDataURL).toHaveBeenCalledWith('image/png', 0.92)
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('honours the requested image format and quality', async () => {
    await exportComponent(Dummy, {}, 'zekr', { format: 'jpeg', quality: 0.5 })
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5)
  })

  it('falls back to png for an unknown format', async () => {
    await exportComponent(Dummy, {}, 'zekr', { format: 'bmp' })
    expect(toDataURL).toHaveBeenCalledWith('image/png', 0.92)
  })

  it('cleans up the temporary container after exporting', async () => {
    const before = document.body.children.length
    await exportComponent(Dummy, {})
    expect(document.body.children.length).toBe(before)
  })

  it('rethrows when html2canvas fails', async () => {
    html2canvas.mockRejectedValueOnce(new Error('boom'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(exportComponent(Dummy, {})).rejects.toThrow('boom')

    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
