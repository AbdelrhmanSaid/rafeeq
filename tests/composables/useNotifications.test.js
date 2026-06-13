import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotifications } from '@/composables/useNotifications'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useNotifications - permission state', () => {
  it('reports supported in an environment with Notification', () => {
    const { isSupported } = useNotifications()
    expect(isSupported.value).toBe(true)
  })

  it('exposes permission flags derived from the store', () => {
    Notification.permission = 'default'
    const { canRequest, isGranted, isDenied } = useNotifications()
    expect(canRequest.value).toBe(true)
    expect(isGranted.value).toBe(false)
    expect(isDenied.value).toBe(false)
  })

  it('requestPermission resolves true and flips isGranted when granted', async () => {
    Notification.requestPermission = vi.fn().mockResolvedValue('granted')
    const { requestPermission, isGranted } = useNotifications()

    const granted = await requestPermission()
    expect(granted).toBe(true)
    expect(isGranted.value).toBe(true)
  })
})

describe('useNotifications - settings bindings', () => {
  it('writes through the morning/evening settings setters', () => {
    const { morningEnabled, morningTime, eveningEnabled, eveningTime } = useNotifications()

    morningEnabled.value = true
    morningTime.value = '07:30'
    eveningEnabled.value = true
    eveningTime.value = '19:45'

    expect(morningEnabled.value).toBe(true)
    expect(morningTime.value).toBe('07:30')
    expect(eveningEnabled.value).toBe(true)
    expect(eveningTime.value).toBe('19:45')
  })
})

describe('useNotifications - scheduling helpers', () => {
  it('returns null for a disabled reminder', () => {
    const { getNextNotificationTime } = useNotifications()
    expect(getNextNotificationTime('morning')).toBeNull()
  })

  it('schedules for later the same day when the time has not passed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T08:00:00'))

    const { morningEnabled, morningTime, getNextNotificationTime } = useNotifications()
    morningEnabled.value = true
    morningTime.value = '12:00'

    const next = getNextNotificationTime('morning')
    expect(next.getDate()).toBe(13)
    expect(next.getHours()).toBe(12)
    expect(next.getMinutes()).toBe(0)
  })

  it('schedules for tomorrow when the time has already passed today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T14:00:00'))

    const { morningEnabled, morningTime, getNextNotificationTime } = useNotifications()
    morningEnabled.value = true
    morningTime.value = '06:00'

    const next = getNextNotificationTime('morning')
    expect(next.getDate()).toBe(14)
    expect(next.getHours()).toBe(6)
  })

  it('formats the time until the next notification', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T08:00:00'))

    const { eveningEnabled, eveningTime, getTimeUntilNext } = useNotifications()
    eveningEnabled.value = true
    eveningTime.value = '10:30' // 2h 30m away

    expect(getTimeUntilNext('evening')).toBe('2 ساعة و 30 دقيقة')
  })

  it('formats sub-hour durations without the hours part', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T08:00:00'))

    const { eveningEnabled, eveningTime, getTimeUntilNext } = useNotifications()
    eveningEnabled.value = true
    eveningTime.value = '08:45' // 45m away

    expect(getTimeUntilNext('evening')).toBe('45 دقيقة')
  })

  it('returns null from getTimeUntilNext when disabled', () => {
    const { getTimeUntilNext } = useNotifications()
    expect(getTimeUntilNext('morning')).toBeNull()
  })
})

describe('useNotifications - test notification guard', () => {
  it('does nothing and warns when permission is not granted', async () => {
    Notification.permission = 'default'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { showTestNotification } = useNotifications()

    const result = await showTestNotification('morning')
    expect(result).toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
