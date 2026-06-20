import { describe, it, expect } from 'vitest'
import { STORAGE_KEYS } from './storageKeys'

describe('STORAGE_KEYS', () => {
  it('has no duplicate key values', () => {
    const values = Object.values(STORAGE_KEYS)
    expect(new Set(values).size).toBe(values.length)
  })
})
