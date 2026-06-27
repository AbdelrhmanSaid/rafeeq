import { beforeEach, describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { useAppStore } from './app'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useAppStore defaults', () => {
  it('exposes the expected zekr defaults', () => {
    const store = useAppStore()

    expect(store.autoUpdateServiceWorker).toBe(true)
    expect(store.zekrVibrationEnabled).toBe(true)
    expect(store.zekrVibrationIntensity).toBe(60)
    expect(store.zekrMoveNextOnComplete).toBe(false)
    expect(store.zekrSaveProgress).toBe(true)
    expect(store.zekrConfirmOnLeave).toBe(true)
  })
})

describe('zekrVibrationIntensity sanitisation', () => {
  it('repairs a non-finite persisted intensity', () => {
    localStorage.setItem(STORAGE_KEYS.zekrVibrationIntensity, 'null')
    expect(useAppStore().zekrVibrationIntensity).toBe(60)
  })

  it('keeps a valid persisted intensity', () => {
    localStorage.setItem(STORAGE_KEYS.zekrVibrationIntensity, '90')
    expect(useAppStore().zekrVibrationIntensity).toBe(90)
  })
})
