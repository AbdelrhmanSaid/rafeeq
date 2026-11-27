import { afterEach, describe, expect, it } from 'vitest'
import { useMeta } from './head'

afterEach(() => {
  document.title = ''
  document.head.innerHTML = ''
})

describe('useMeta', () => {
  it('suffixes a page title with the app name', () => {
    useMeta({ title: 'السبحة' })

    expect(document.title).toBe('السبحة - رفيق')
    expect(document.head.querySelector('meta[property="og:title"]').content).toBe('السبحة - رفيق')
  })

  it.each([undefined, null, ''])('falls back to the default title when the title is %j', (title) => {
    useMeta({ title, description: undefined, keywords: undefined })

    expect(document.title).toBe('رفيق - زادك في الطريق')
    expect(document.head.querySelector('meta[name="description"]').content).not.toBe('undefined')
  })
})
