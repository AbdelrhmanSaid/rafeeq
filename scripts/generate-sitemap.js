import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Radios from '../src/exports/Radios.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'https://rafeeq.me'

const staticRoutes = [
  '/',
  '/quran',
  '/azkar',
  '/radio',
  '/sebha',
  '/zakat',
  '/settings',
  '/privacy'
]

const sitemap = []

// Add static routes
staticRoutes.forEach(route => {
  sitemap.push(`${BASE_URL}${route}`)
})

// Add Quran surahs
for (let i = 1; i <= 114; i++) {
  sitemap.push(`${BASE_URL}/quran/${i}`)
}

// Add Azkar categories
const azkarDir = path.join(__dirname, '../public/data/azkar')
const azkarFiles = fs.readdirSync(azkarDir).filter(file => file.endsWith('.json'))
azkarFiles.forEach(file => {
  const category = file.replace('.json', '')
  sitemap.push(`${BASE_URL}/azkar/${category}`)
})

// Add Radios
Object.keys(Radios).forEach(slug => {
  sitemap.push(`${BASE_URL}/radio/${slug}`)
})

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>${url === BASE_URL + '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml)