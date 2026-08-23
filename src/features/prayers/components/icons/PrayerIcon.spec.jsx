import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import PrayerIcon from './PrayerIcon'

describe('PrayerIcon', () => {
  it('resolves the icon from the name prop', () => {
    const fajr = render(<PrayerIcon name="fajr" />)
    const isha = render(<PrayerIcon name="isha" />)

    expect(fajr.container.querySelector('svg')).not.toBeNull()
    // Distinct names render distinct icons — proves the lookup is name-driven.
    expect(fajr.container.innerHTML).not.toBe(isha.container.innerHTML)
  })

  it('renders nothing for an unknown name', () => {
    const { container } = render(<PrayerIcon name="nope" />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
