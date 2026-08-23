import { useSearch } from '@/shared/hooks/useSearch'
import FavoriteList from '@/shared/ui/FavoriteList'

const DEFAULT_SEARCH_KEYS = ['name']

// <FavoriteList> with a search box wired to it.
export default function SearchableFavoritesList({
  items,
  searchKeys = DEFAULT_SEARCH_KEYS,
  placeholder = 'ابحث',
  label = 'تبحث عن شيء معين؟',
  searchType = 'text',
  ...listProps
}) {
  const { search, setSearch, filtered } = useSearch(items, searchKeys)

  return (
    <>
      <div className="form-floating mb-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          type={searchType}
          className="form-control"
          placeholder={placeholder}
        />
        <label>{label}</label>
      </div>

      <FavoriteList items={filtered} search={search} {...listProps} />
    </>
  )
}
