import { useState } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ZekrCard from '@/features/azkar/components/ZekrCard'
import { toArabicNumerals } from '@/shared/utils/arabic'

// Counting happens via the counter button on desktop viewports.
vi.mock('@/shared/hooks/useIsMobile', () => ({ useIsMobile: () => false }))

const vibrateOnFinish = vi.fn()
const scrollToNextZekr = vi.fn()

vi.mock('@/features/azkar/hooks/useZekrVibration', () => ({
  useZekrVibration: () => ({ vibrateOnFinish }),
}))
vi.mock('@/features/azkar/hooks/useZekrScroll', () => ({
  useZekrScroll: () => ({ scrollToNextZekr }),
}))

// Mirror how AzkarCategoryView owns the count and feeds it back as a prop, so
// the test exercises the real controlled-count path.
function CountedZekrCard({ repeat }) {
  const [count, setCount] = useState(0)
  return <ZekrCard text="ذكر" repeat={repeat} count={count} onCountChange={setCount} />
}

const counter = () => screen.getByLabelText('عداد الذكر')
const clickCounter = () => fireEvent.click(counter())
const countOf = (repeat, count) => toArabicNumerals(`${count}/${repeat}`)

describe('ZekrCard', () => {
  beforeEach(() => {
    vibrateOnFinish.mockClear()
    scrollToNextZekr.mockClear()
  })

  it('vibrates and scrolls to the next zekr once the count reaches repeat (repeat=1)', () => {
    render(<CountedZekrCard repeat={1} />)

    clickCounter()

    expect(counter()).toHaveAttribute('data-content', countOf(1, 1))
    expect(vibrateOnFinish).toHaveBeenCalledTimes(1)
    expect(scrollToNextZekr).toHaveBeenCalledTimes(1)
  })

  it('only fires the completion behavior on the final increment (repeat=3)', () => {
    render(<CountedZekrCard repeat={3} />)

    clickCounter()
    clickCounter()
    expect(vibrateOnFinish).not.toHaveBeenCalled()
    expect(scrollToNextZekr).not.toHaveBeenCalled()

    clickCounter()

    expect(counter()).toHaveAttribute('data-content', countOf(3, 3))
    expect(vibrateOnFinish).toHaveBeenCalledTimes(1)
    expect(scrollToNextZekr).toHaveBeenCalledTimes(1)
  })

  it('does not count or re-fire past the required repeat', () => {
    render(<CountedZekrCard repeat={2} />)

    clickCounter()
    clickCounter()
    clickCounter()

    expect(counter()).toHaveAttribute('data-content', countOf(2, 2))
    expect(vibrateOnFinish).toHaveBeenCalledTimes(1)
    expect(scrollToNextZekr).toHaveBeenCalledTimes(1)
  })
})
