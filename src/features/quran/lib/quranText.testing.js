import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { quranVerses } from './quranText.js'

// The text the build serves, for specs that search the real Quran.
export const readVerses = () =>
  quranVerses((page) => JSON.parse(readFileSync(resolve(process.cwd(), `public/data/mushaf/${page}.json`), 'utf8')))
