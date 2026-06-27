import { beforeEach, describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { useAzkarProgress } from './useAzkarProgress'

const today = () => new Date().toLocaleDateString('en-CA')
const keyFor = (slug) => `${STORAGE_KEYS.azkarProgress}:${slug}`

beforeEach(() => {
  localStorage.clear()
})

describe('useAzkarProgress (persistent)', () => {
  it('starts with empty counts', () => {
    const { counts } = useAzkarProgress('morning')
    expect(counts.value).toEqual({})
  })

  it("reads today's persisted counts", () => {
    localStorage.setItem(keyFor('morning'), JSON.stringify({ date: today(), counts: { 0: 3 } }))
    const { counts } = useAzkarProgress('morning')
    expect(counts.value).toEqual({ 0: 3 })
  })

  it('discards counts saved on a previous day', () => {
    localStorage.setItem(keyFor('morning'), JSON.stringify({ date: '2000-01-01', counts: { 0: 9 } }))
    const { counts } = useAzkarProgress('morning')
    expect(counts.value).toEqual({})
  })

  it('reset clears the stored counts', async () => {
    localStorage.setItem(keyFor('morning'), JSON.stringify({ date: today(), counts: { 0: 3 } }))
    const { counts, reset } = useAzkarProgress('morning')

    reset()
    await nextTick()

    expect(counts.value).toEqual({})
    expect(JSON.parse(localStorage.getItem(keyFor('morning'))).counts).toEqual({})
  })
})

describe('useAzkarProgress (in-memory)', () => {
  it('does not touch localStorage when persistence is off', () => {
    const { counts } = useAzkarProgress('morning', false)
    expect(counts.value).toEqual({})
    expect(localStorage.getItem(keyFor('morning'))).toBeNull()
  })
})
