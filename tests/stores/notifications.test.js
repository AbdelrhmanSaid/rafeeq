import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

beforeEach(() => {
  setActivePinia(createPinia())
  Notification.permission = 'default'
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('notifications store - permission', () => {
  it('reports supported and default permission flags', () => {
    const store = useNotificationStore()
    expect(store.isSupported).toBe(true)
    expect(store.canRequest).toBe(true)
    expect(store.isGranted).toBe(false)
    expect(store.isDenied).toBe(false)
  })

  it('requestPermission updates state when granted', async () => {
    Notification.requestPermission = vi.fn().mockResolvedValue('granted')
    const store = useNotificationStore()

    const result = await store.requestPermission()
    expect(result).toBe(true)
    expect(store.permission).toBe('granted')
    expect(store.isGranted).toBe(true)
  })

  it('requestPermission returns false when denied', async () => {
    Notification.requestPermission = vi.fn().mockResolvedValue('denied')
    const store = useNotificationStore()

    const result = await store.requestPermission()
    expect(result).toBe(false)
    expect(store.isDenied).toBe(true)
  })

  it('requestPermission short-circuits to true when already granted', async () => {
    Notification.permission = 'granted'
    Notification.requestPermission = vi.fn()
    const store = useNotificationStore()

    const result = await store.requestPermission()
    expect(result).toBe(true)
    expect(Notification.requestPermission).not.toHaveBeenCalled()
  })
})

describe('notifications store - settings', () => {
  it('exposes the stored default times', () => {
    const store = useNotificationStore()
    expect(store.morningTime).toBe('06:00')
    expect(store.eveningTime).toBe('18:00')
    expect(store.morningEnabled).toBe(false)
    expect(store.eveningEnabled).toBe(false)
  })

  it('updateMorningSettings updates the stored values', () => {
    const store = useNotificationStore()
    store.updateMorningSettings(true, '05:15')
    expect(store.morningEnabled).toBe(true)
    expect(store.morningTime).toBe('05:15')
  })

  it('updateEveningSettings updates the stored values', () => {
    const store = useNotificationStore()
    store.updateEveningSettings(true, '20:00')
    expect(store.eveningEnabled).toBe(true)
    expect(store.eveningTime).toBe('20:00')
  })
})

describe('notifications store - scheduling', () => {
  it('schedules a timeout for an enabled reminder when permission is granted', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T00:00:00'))
    Notification.permission = 'granted'

    const store = useNotificationStore()
    store.updateMorningSettings(true, '06:00')

    // A pending timer should now exist for the morning reminder.
    expect(vi.getTimerCount()).toBeGreaterThan(0)
  })

  it('clearAllNotifications cancels scheduled reminders', () => {
    vi.useFakeTimers()
    Notification.permission = 'granted'

    const store = useNotificationStore()
    store.updateMorningSettings(true, '06:00')
    store.updateEveningSettings(true, '18:00')
    store.clearAllNotifications()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('initialize does nothing when permission is not granted', () => {
    vi.useFakeTimers()
    Notification.permission = 'default'

    const store = useNotificationStore()
    store.initialize()
    expect(vi.getTimerCount()).toBe(0)
  })
})
