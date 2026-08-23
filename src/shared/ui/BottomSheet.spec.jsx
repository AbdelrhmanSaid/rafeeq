import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomSheet from './BottomSheet'

function Harness({ onClose = () => {}, show = true }) {
  return (
    <>
      <button>opener</button>
      <BottomSheet show={show} title="العنوان" onClose={onClose}>
        <button>first</button>
        <button>second</button>
      </BottomSheet>
    </>
  )
}

describe('BottomSheet', () => {
  it('exposes modal dialog semantics labelled by its title', () => {
    render(<Harness />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('العنوان')
  })

  it('moves focus inside on open and restores it on close', () => {
    const { rerender } = render(<Harness show={false} />)
    const opener = screen.getByText('opener')
    opener.focus()

    rerender(<Harness show={true} />)
    expect(screen.getByText('first')).toHaveFocus()

    rerender(<Harness show={false} />)
    expect(opener).toHaveFocus()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('traps Tab within the sheet', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const first = screen.getByText('first')
    const second = screen.getByText('second')
    const close = screen.getByLabelText('إغلاق')

    expect(first).toHaveFocus()
    await user.tab()
    expect(second).toHaveFocus()
    // Past the last control, Tab wraps to the first one (the close button).
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()
    await user.tab({ shift: true })
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(second).toHaveFocus()
  })
})
