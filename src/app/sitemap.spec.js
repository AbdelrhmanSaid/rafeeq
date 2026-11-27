import { describe, expect, it } from 'vitest'
import router from '@/app/router'
import { STATIC_ROUTES, sitemapPaths, sitemapXml } from './sitemap'

describe('sitemap', () => {
  it('lists every static screen the router serves', () => {
    const screens = router
      .getRoutes()
      .filter((route) => !route.aliasOf && !route.redirect && !route.path.startsWith('/embed'))
      // An optional trailing param (/zakat/:tab?) is the screen itself.
      .map((route) => route.path.replace(/\/:[^/]+\?$/, ''))
      .filter((path) => !path.includes(':'))

    expect([...STATIC_ROUTES].sort()).toEqual(screens.sort())
  })

  it('lists the Mushaf pages, azkar categories and radio stations', () => {
    const paths = sitemapPaths()

    expect(paths).toContain('/quran/page/1')
    expect(paths).toContain('/quran/page/604')
    expect(paths).toContain('/azkar/morning')
    expect(paths.some((path) => path.startsWith('/radio/'))).toBe(true)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('writes one absolute <loc> per path', () => {
    const xml = sitemapXml()

    expect(xml.match(/<loc>https:\/\/rafeeq\.me\//g)).toHaveLength(sitemapPaths().length)
    expect(xml).toContain('<loc>https://rafeeq.me/</loc>')
  })
})
