import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { setMeta } from '@/shared/utils/head'

// Applies page meta (title/description/keywords) as soon as it resolves. Pass a
// falsy value while the data the meta depends on is still loading.
//
// Re-applies on every pathname change too: the app shell resets meta on
// navigation, and a view whose meta payload is identical across two paths
// (the 404 page for /quran/abc -> /quran/999, a surah whose data hasn't
// refreshed yet) would otherwise stay reset.
export function usePageMeta(meta) {
  const { pathname } = useLocation()
  const serialized = meta ? JSON.stringify(meta) : null

  useEffect(() => {
    if (serialized) setMeta(JSON.parse(serialized))
  }, [serialized, pathname])
}
