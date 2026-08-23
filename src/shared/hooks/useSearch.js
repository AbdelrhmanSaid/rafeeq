import { useMemo, useState } from 'react'
import { normalize } from '@/shared/utils/arabic'

// Client-side search over `items`, matching the normalized form of `keys` so
// Arabic spelling variants (hamza, taa marbuta, digits) still match.
export const useSearch = (items, keys = []) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return items

    const normalizedSearch = normalize(search)

    return items.filter((item) => keys.some((key) => normalize(item[key]).includes(normalizedSearch)))
  }, [items, keys, search])

  return { search, setSearch, filtered }
}
