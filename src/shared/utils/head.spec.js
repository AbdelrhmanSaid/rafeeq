import { beforeEach, describe, it, expect } from 'vitest'
import { useMeta } from './head'

const DEFAULT_TITLE = 'رفيق - زادك في الطريق'

const content = (selector) => document.head.querySelector(selector)?.getAttribute('content')

beforeEach(() => {
  document.head.querySelectorAll('meta').forEach((el) => el.remove())
  document.title = ''
})

describe('useMeta', () => {
  it('applies the default title without an app-name suffix', () => {
    useMeta({})
    expect(document.title).toBe(DEFAULT_TITLE)
  })

  it('appends the app name to a custom title', () => {
    useMeta({ title: 'الأذكار' })
    expect(document.title).toBe('الأذكار - رفيق')
  })

  it('writes description and joined keywords', () => {
    useMeta({ description: 'وصف', keywords: ['أ', 'ب'] })

    expect(content('meta[name="description"]')).toBe('وصف')
    expect(content('meta[name="keywords"]')).toBe('أ, ب')
  })

  it('sets Open Graph and Twitter tags from the resolved title', () => {
    useMeta({ title: 'القرآن' })

    expect(content('meta[property="og:title"]')).toBe('القرآن - رفيق')
    expect(content('meta[name="twitter:title"]')).toBe('القرآن - رفيق')
  })

  it('updates existing meta tags instead of creating duplicates', () => {
    useMeta({ description: 'أول' })
    useMeta({ description: 'ثانٍ' })

    const tags = document.head.querySelectorAll('meta[name="description"]')
    expect(tags).toHaveLength(1)
    expect(tags[0].getAttribute('content')).toBe('ثانٍ')
  })
})
