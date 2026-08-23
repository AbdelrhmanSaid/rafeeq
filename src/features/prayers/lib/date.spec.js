import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatAladhanDate } from './date'

describe('formatAladhanDate', () => {
  afterEach(() => vi.useRealTimers())

  it('formats as DD-MM-YYYY with zero padding', () => {
    expect(formatAladhanDate(new Date(2026, 0, 5, 12))).toBe('05-01-2026')
  })

  it('uses the local calendar day even when the UTC day differs', () => {
    // 00:30 local on the 23rd. For any zone east of UTC this instant is still
    // the 22nd in UTC — the old toISOString() approach would return 22-08-2026.
    const localMidnight = new Date(2026, 7, 23, 0, 30)
    expect(formatAladhanDate(localMidnight)).toBe('23-08-2026')

    // Sanity-check the test itself: in an eastern zone the UTC day must differ.
    if (localMidnight.getTimezoneOffset() < 0) {
      expect(localMidnight.toISOString().startsWith('2026-08-22')).toBe(true)
    }
  })

  it('crosses the year boundary by local time', () => {
    expect(formatAladhanDate(new Date(2025, 11, 31, 23, 59))).toBe('31-12-2025')
    expect(formatAladhanDate(new Date(2026, 0, 1, 0, 0))).toBe('01-01-2026')
  })

  it('defaults to now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 9, 1, 0))
    expect(formatAladhanDate()).toBe('09-03-2026')
  })
})
