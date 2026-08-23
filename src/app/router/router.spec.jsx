import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '@/app/router'

const renderAt = (path) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('router', () => {
  it('renders a page inside the app shell', async () => {
    renderAt('/sebha')

    expect(await screen.findByRole('heading', { name: /السبحة الإلكترونية/ })).toBeInTheDocument()
    // The shell contributes the desktop nav and the mobile tab bar.
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0)
  })

  it('serves the same page under /embed without the app chrome', async () => {
    renderAt('/embed/sebha')

    expect(await screen.findByRole('heading', { name: /السبحة الإلكترونية/ })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('falls back to the not-found page for an unknown path', async () => {
    renderAt('/nope')

    expect(await screen.findByText('الصفحة التي تبحث عنها غير موجودة.')).toBeInTheDocument()
  })
})
