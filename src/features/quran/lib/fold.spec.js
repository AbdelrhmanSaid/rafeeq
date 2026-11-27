import { describe, expect, it } from 'vitest'
import { foldWord, skeleton } from './fold'

describe('foldWord', () => {
  it.each([
    ['ٱلْعَـٰلَمِينَ', 'العالمين'],
    ['ٱلصَّلَوٰةَ', 'الصلاه'],
    ['ٱلتَّوْرَىٰةَ', 'التوراه'],
    ['مُوسَىٰ', 'موسي'],
    ['ٱلَّيْلِ', 'الليل'],
    ['ٱلَّذِينَ', 'الذين'],
    ['ٱللَّهِ', 'الله'],
    ['إِبْرَٰهِـۧمَ', 'ابراهيم'],
    ['ٱلسَّمَـٰوَٰتِ', 'السموت'],
  ])('reads the Mushaf’s %s as %s', (word, key) => {
    expect(foldWord(word)).toBe(key)
  })

  it.each([
    ['ءَامَنُوا۟', 'آمنوا'],
    ['ٱلْقُرْءَانُ', 'القرآن'],
    ['بِـَٔايَـٰتِنَا', 'بآياتنا'],
    ['يَسْـَٔلُونَكَ', 'يسألونك'],
    ['أَرَءَيْتُمْ', 'أرأيتم'],
    ['يَسْتَهْزِءُونَ', 'يستهزئون'],
    ['شَيْـًٔا', 'شيئا'],
    ['جَآءَهُمْ', 'جاءهم'],
    ['أَءِذَا', 'أإذا'],
    ['يَـٰٓأَيُّهَا', 'ياأيها'],
  ])('seats the hamza of %s as %s is spelled', (mushaf, typed) => {
    expect(foldWord(mushaf)).toBe(foldWord(typed))
  })

  it.each([
    ['الرحمان', 'الرحمن'],
    ['هاذا', 'هذا'],
    ['لاكن', 'لكن'],
    ['اولائك', 'أولئك'],
    ['السموات', 'السماوات'],
    ['داوود', 'داود'],
    ['امنو', 'آمنوا'],
    ['الصلاه', 'الصلاة'],
    ['هدي', 'هدى'],
    ['الْحَمْدُ', 'الحمد'],
  ])('takes %s for %s', (typed, standard) => {
    expect(foldWord(typed)).toBe(foldWord(standard))
  })

  it('has nothing to say about a word with no Arabic letters', () => {
    expect(foldWord('ۖ')).toBe('')
    expect(foldWord('quran 114')).toBe('')
  })
})

describe('skeleton', () => {
  it.each([
    ['العصر', 'العسر'],
    ['الضالمين', 'الظالمين'],
    ['مومنون', 'مؤمنون'],
    ['ابراهم', 'إبراهيم'],
    ['الصرات', 'الصراط'],
  ])('is the same for %s and %s', (typed, standard) => {
    expect(skeleton(foldWord(typed))).toBe(skeleton(foldWord(standard)))
  })

  it('still tells apart words that differ in a consonant', () => {
    expect(skeleton(foldWord('كتاب'))).not.toBe(skeleton(foldWord('كتان')))
  })
})
