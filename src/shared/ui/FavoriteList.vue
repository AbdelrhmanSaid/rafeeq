<script setup>
import { computed } from 'vue'
import { IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { useFavorites } from '@/shared/composables/useFavorites'
import EmptyState from '@/shared/ui/EmptyState.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  search: {
    type: String,
    default: '',
  },
  itemKey: {
    type: String,
    required: true,
  },
  favoritesKey: {
    type: String,
    required: true,
  },
  itemClass: {
    type: Function,
    default: () => ({}),
  },
  // Optional sections, as [{ key, title }]; each item goes in the section named by its `groupKey` field.
  groups: {
    type: Array,
    default: null,
  },
  groupKey: {
    type: String,
    default: 'category',
  },
  // Names the item in the favourite button's label, e.g. (item) => item.name.
  itemLabel: {
    type: Function,
    default: null,
  },
})

const { isFavorite, toggleFavorite, filterFavorites } = useFavorites(props.favoritesKey)

const getKey = (item) => item[props.itemKey]
const favorites = filterFavorites(() => props.items, getKey)

const favoriteLabel = (item) => {
  const added = isFavorite(getKey(item))
  if (!props.itemLabel) return added ? 'إزالة من المفضلة' : 'إضافة للمفضلة'

  const name = props.itemLabel(item)
  return added ? `إزالة ${name} من المفضلة` : `إضافة ${name} للمفضلة`
}

const sections = computed(() => {
  if (!props.groups) return [{ key: 'all', title: null, items: props.items }]

  return props.groups
    .map((group) => ({ ...group, items: props.items.filter((item) => item[props.groupKey] === group.key) }))
    .filter((group) => group.items.length)
})
</script>

<template>
  <div v-if="favorites.length && !search" class="mb-4">
    <slot name="favorites-title" />
    <ul class="list-group">
      <li
        v-for="(item, index) in favorites"
        :key="getKey(item)"
        class="list-group-item list-group-item-action fav-row"
        :class="itemClass(item)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <slot :item="item" :index="index" />

          <div class="d-flex gap-1 fav-actions">
            <button
              class="btn btn-flat btn-icon fav-btn is-active position-relative z-1"
              @click.stop="toggleFavorite(getKey(item))"
              title="إزالة من المفضلة"
              :aria-label="favoriteLabel(item)"
            >
              <IconHeartFilled size="1.25rem" class="text-danger" />
            </button>

            <slot name="actions" :item="item" />
          </div>
        </div>
      </li>
    </ul>
  </div>

  <!-- Once favourites sit on top, the full list below them gets its own heading (grouped lists keep their sections). -->
  <slot v-if="favorites.length && !search" name="all-title" />
  <div v-for="section in sections" :key="section.key" class="fav-section">
    <h2 v-if="section.title" class="list-title">{{ section.title }}</h2>
    <ul class="list-group">
      <li
        v-for="(item, index) in section.items"
        :key="getKey(item)"
        class="list-group-item list-group-item-action fav-row"
        :class="itemClass(item)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <slot :item="item" :index="index" />

          <div class="d-flex gap-1 fav-actions">
            <button
              class="btn btn-flat btn-icon fav-btn position-relative z-1"
              :class="{ 'is-active': isFavorite(getKey(item)) }"
              @click.stop="toggleFavorite(getKey(item))"
              :title="isFavorite(getKey(item)) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
              :aria-label="favoriteLabel(item)"
            >
              <IconHeartFilled v-if="isFavorite(getKey(item))" size="1.25rem" class="text-danger" />
              <IconHeart v-else size="1.25rem" />
            </button>

            <slot name="actions" :item="item" />
          </div>
        </div>
      </li>
    </ul>
  </div>

  <ul v-if="items.length === 0" class="list-group">
    <li class="list-group-item">
      <EmptyState />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
/* Compact rows: the 44px action buttons set the height. The name reads at full strength (list actions default to the
   muted colour); details inside the row mute themselves. */
.fav-row {
  --bs-list-group-action-color: var(--bs-body-color);
  padding-block: 0.375rem;
}

.fav-row :deep(.list-index) {
  width: 2rem;
  height: 2rem;
  font-size: 0.8125rem;
}

.fav-section + .fav-section {
  margin-top: 1.5rem;
}

.fav-actions {
  margin-inline-end: -0.75rem;
}

.fav-btn {
  border-radius: 50%;
  color: var(--bs-secondary-color);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s var(--app-ease);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: rgba(var(--bs-danger-rgb), 0.1);
      color: var(--bs-danger);
    }
  }

  &:active {
    transform: scale(0.9);
  }

  &.is-active {
    color: var(--bs-danger);
  }
}
</style>
