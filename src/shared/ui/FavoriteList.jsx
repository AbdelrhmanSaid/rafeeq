import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { useFavorites } from '@/shared/hooks/useFavorites'
import EmptyState from '@/shared/ui/EmptyState'
import styles from './FavoriteList.module.scss'

const noClass = () => ''

/**
 * A list whose entries can be favorited. Favorites are pinned to a second list
 * above the full one, which is hidden while a search is active.
 */
export default function FavoriteList({
  items,
  search = '',
  itemKey,
  favoritesKey,
  itemClass = noClass,
  favoritesTitle = null,
  allTitle = null,
  renderItem,
  renderActions,
}) {
  const { isFavorite, toggleFavorite, filterFavorites } = useFavorites(favoritesKey)

  const getKey = (item) => item[itemKey]
  const favorites = filterFavorites(items, getKey)
  const showFavorites = favorites.length > 0 && !search

  const renderRow = (item, index, favorited) => (
    <li key={getKey(item)} className={`list-group-item list-group-item-action py-3 ${itemClass(item)}`}>
      <div className="d-flex justify-content-between align-items-center">
        {renderItem?.(item, index)}

        <div className="d-flex gap-2">
          <button
            className="btn btn-flat position-relative z-1"
            onClick={() => toggleFavorite(getKey(item))}
            title={favorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            {favorited ? <IconHeartFilled size="1.25rem" className="text-danger" /> : <IconHeart size="1.25rem" />}
          </button>

          {renderActions?.(item)}
        </div>
      </div>
    </li>
  )

  return (
    <div className={styles.list}>
      {showFavorites && (
        <div className="mb-4">
          {favoritesTitle}
          <ul className="list-group">{favorites.map((item, index) => renderRow(item, index, true))}</ul>
        </div>
      )}

      {showFavorites && allTitle}

      <ul className="list-group">
        {items.map((item, index) => renderRow(item, index, isFavorite(getKey(item))))}

        {items.length === 0 && (
          <li className="list-group-item">
            <EmptyState />
          </li>
        )}
      </ul>
    </div>
  )
}
