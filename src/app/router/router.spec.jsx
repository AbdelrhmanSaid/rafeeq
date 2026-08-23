import { describe, it, expect } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
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

  it.each(['/quran/foo', '/quran/0', '/quran/115', '/quran/1.5', '/embed/quran/abc'])(
    'rejects an invalid surah param (%s) with the not-found page',
    async (path) => {
      renderAt(path)

      expect(await screen.findByText('الصفحة التي تبحث عنها غير موجودة.')).toBeInTheDocument()
      // The not-found page is rendered inside the shell and sets the 404 meta.
      expect(document.title).toContain('٤٠٤')
    },
  )

  it('rejects an unknown settings tab with the not-found page', async () => {
    renderAt('/settings/typo')

    expect(await screen.findByText('الصفحة التي تبحث عنها غير موجودة.')).toBeInTheDocument()
  })

  it('accepts the known settings tabs', async () => {
    renderAt('/settings/downloads')

    expect(await screen.findByRole('heading', { name: /الإعدادات/ })).toBeInTheDocument()
    expect(screen.queryByText('الصفحة التي تبحث عنها غير موجودة.')).not.toBeInTheDocument()
  })

  it('resets page meta when navigating to a route without static meta', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/sebha'] })
    render(<RouterProvider router={router} />)

    await screen.findByRole('heading', { name: /السبحة الإلكترونية/ })
    expect(document.title).toContain('السبحة الإلكترونية')

    // A dynamic route declares no static meta; the stale title must not linger.
    await act(() => router.navigate('/radio/does-not-exist'))
    await waitFor(() => expect(document.title).not.toContain('السبحة الإلكترونية'))
  })
})
