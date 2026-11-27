import { describe, expect, it } from 'vitest'
import { stationLabel, stationTitle } from './stationLabel'

describe('stationTitle', () => {
  it('spells out translation stations', () => {
    expect(stationTitle({ name: 'الإنجليزية', category: 'translations' })).toBe('ترجمة القرآن بالإنجليزية')
  })

  it('keeps other names as they are', () => {
    expect(stationTitle({ name: 'إذاعة الحرم المكي', category: 'general' })).toBe('إذاعة الحرم المكي')
  })
})

describe('stationLabel', () => {
  it('joins the title and description', () => {
    expect(stationLabel({ name: 'محمود خليل الحصري', description: 'مجود', category: 'reciters' })).toBe(
      'محمود خليل الحصري - مجود',
    )
    expect(stationLabel({ name: 'الإنجليزية', description: 'عبدالله بصفر', category: 'translations' })).toBe(
      'ترجمة القرآن بالإنجليزية - عبدالله بصفر',
    )
  })

  it('uses the title alone when there is no description', () => {
    expect(stationLabel({ name: 'إذاعة الحرم المكي', category: 'general' })).toBe('إذاعة الحرم المكي')
  })
})
