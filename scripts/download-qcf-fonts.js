import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FONTS_BASE = 'https://quran.com/fonts/quran/hafs/v1/woff2'
const SURAH_NAMES_URL = 'https://quran.com/fonts/quran/surah-names/v1/sura_names.woff2'
const OUT_DIR = path.join(__dirname, '../public/fonts/qcfv1')
const PAGES = 604
const CONCURRENCY = 8
const RETRIES = 3

fs.mkdirSync(OUT_DIR, { recursive: true })

async function download(url, dest) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const buffer = Buffer.from(await response.arrayBuffer())
      if (buffer.length === 0) throw new Error('Empty response')
      fs.writeFileSync(dest, buffer)
      return buffer.length
    } catch (error) {
      if (attempt === RETRIES) throw new Error(`${url}: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
}

const jobs = []
for (let page = 1; page <= PAGES; page++) {
  jobs.push({ url: `${FONTS_BASE}/p${page}.woff2`, file: `p${page}.woff2` })
}
jobs.push({ url: SURAH_NAMES_URL, file: 'sura_names.woff2' })

let done = 0
let skipped = 0

async function worker() {
  while (jobs.length > 0) {
    const job = jobs.shift()
    const dest = path.join(OUT_DIR, job.file)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      skipped++
    } else {
      await download(job.url, dest)
    }
    done++
    if (done % 50 === 0) console.log(`${done} fonts processed...`)
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const files = fs.readdirSync(OUT_DIR).filter((file) => file.endsWith('.woff2'))
const empty = files.filter((file) => fs.statSync(path.join(OUT_DIR, file)).size === 0)
if (files.length !== PAGES + 1 || empty.length > 0) {
  console.error(`Verification failed: ${files.length}/${PAGES + 1} files, ${empty.length} empty`)
  process.exit(1)
}

const totalBytes = files.reduce((sum, file) => sum + fs.statSync(path.join(OUT_DIR, file)).size, 0)
console.log(
  `Done: ${files.length} fonts (${skipped} already present), ${(totalBytes / 1024 / 1024).toFixed(1)} MB total`
)
