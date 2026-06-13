import { describe, it, expect, beforeEach } from 'vitest'
import { defaultMeta, setMetaTag, useMeta } from '@/utilities/head'

beforeEach(() => {
  document.head.innerHTML = ''
  document.title = ''
})

describe('setMetaTag', () => {
  it('creates a name-based meta tag when one does not exist', () => {
    setMetaTag({ name: 'description', content: 'hello' })
    const el = document.head.querySelector('meta[name="description"]')
    expect(el).not.toBeNull()
    expect(el.getAttribute('content')).toBe('hello')
  })

  it('creates a property-based meta tag when one does not exist', () => {
    setMetaTag({ property: 'og:title', content: 'title' })
    const el = document.head.querySelector('meta[property="og:title"]')
    expect(el).not.toBeNull()
    expect(el.getAttribute('content')).toBe('title')
  })

  it('updates an existing meta tag instead of duplicating it', () => {
    setMetaTag({ name: 'description', content: 'first' })
    setMetaTag({ name: 'description', content: 'second' })
    const all = document.head.querySelectorAll('meta[name="description"]')
    expect(all).toHaveLength(1)
    expect(all[0].getAttribute('content')).toBe('second')
  })
})

describe('useMeta', () => {
  it('uses default meta when called with no overrides', () => {
    useMeta()
    expect(document.title).toBe(defaultMeta.title)
    expect(document.head.querySelector('meta[name="description"]').getAttribute('content')).toBe(
      defaultMeta.description,
    )
  })

  it('appends the app name to a custom title', () => {
    useMeta({ title: 'الإعدادات' })
    expect(document.title).toBe('الإعدادات - رفيق')
  })

  it('does not append the app name when the title equals the default title', () => {
    useMeta({ title: defaultMeta.title })
    expect(document.title).toBe(defaultMeta.title)
  })

  it('joins keywords into a comma-separated string', () => {
    useMeta({ keywords: ['a', 'b', 'c'] })
    expect(document.head.querySelector('meta[name="keywords"]').getAttribute('content')).toBe('a, b, c')
  })

  it('sets open graph and twitter meta tags', () => {
    useMeta({ title: 'صفحة', description: 'وصف' })
    expect(document.head.querySelector('meta[property="og:title"]').getAttribute('content')).toBe('صفحة - رفيق')
    expect(document.head.querySelector('meta[property="og:description"]').getAttribute('content')).toBe('وصف')
    expect(document.head.querySelector('meta[name="twitter:title"]').getAttribute('content')).toBe('صفحة - رفيق')
    expect(document.head.querySelector('meta[name="twitter:description"]').getAttribute('content')).toBe('وصف')
  })
})

describe('defaultMeta', () => {
  it('exposes a title, description, and keyword list', () => {
    expect(typeof defaultMeta.title).toBe('string')
    expect(typeof defaultMeta.description).toBe('string')
    expect(Array.isArray(defaultMeta.keywords)).toBe(true)
    expect(defaultMeta.keywords.length).toBeGreaterThan(0)
  })
})
