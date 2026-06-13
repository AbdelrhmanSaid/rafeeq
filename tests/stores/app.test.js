import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('app store', () => {
  it('defaults autoUpdateServiceWorker to true', () => {
    const store = useAppStore()
    expect(store.autoUpdateServiceWorker).toBe(true)
  })

  it('persists changes to localStorage', async () => {
    const store = useAppStore()
    store.autoUpdateServiceWorker = false
    await nextTick()
    expect(localStorage.getItem('auto-update-service-worker')).toBe('false')
  })

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('auto-update-service-worker', 'false')
    setActivePinia(createPinia())
    const store = useAppStore()
    expect(store.autoUpdateServiceWorker).toBe(false)
  })
})
