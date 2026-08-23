import { useEffect } from 'react'
import { setMeta } from '@/shared/utils/head'

// Applies page meta (title/description/keywords) as soon as it resolves. Pass a
// falsy value while the data the meta depends on is still loading.
export function usePageMeta(meta) {
  const serialized = meta ? JSON.stringify(meta) : null

  useEffect(() => {
    if (serialized) setMeta(JSON.parse(serialized))
  }, [serialized])
}
