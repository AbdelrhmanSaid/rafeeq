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
})

const { isFavorite, toggleFavorite, filterFavorites } = useFavorites(props.favoritesKey)

const getKey = (item) => item[props.itemKey]
const favorites = filterFavorites(
  () => props.items,
  (item) => getKey(item),
)
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

          <div class="d-flex gap-2 fav-actions">
            <button
              class="btn btn-flat btn-icon fav-btn is-active position-relative z-1"
              @click.stop="toggleFavorite(getKey(item))"
              title="إزالة من المفضلة"
            >
              <IconHeartFilled size="1.25rem" class="text-danger" />
            </button>

            <slot name="actions" :item="item" />
          </div>
        </div>
      </li>
    </ul>
  </div>

  <slot v-if="favorites.length && !search" name="all-title" />
  <ul class="list-group">
    <li
      v-for="(item, index) in items"
      :key="getKey(item)"
      class="list-group-item list-group-item-action fav-row"
      :class="itemClass(item)"
    >
      <div class="d-flex justify-content-between align-items-center">
        <slot :item="item" :index="index" />

        <div class="d-flex gap-2 fav-actions">
          <button
            class="btn btn-flat btn-icon fav-btn position-relative z-1"
            :class="{ 'is-active': isFavorite(getKey(item)) }"
            @click.stop="toggleFavorite(getKey(item))"
            :title="isFavorite(getKey(item)) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
          >
            <IconHeartFilled v-if="isFavorite(getKey(item))" size="1.25rem" class="text-danger" />
            <IconHeart v-else size="1.25rem" />
          </button>

          <slot name="actions" :item="item" />
        </div>
      </div>
    </li>

    <li v-if="items.length === 0" class="list-group-item">
      <EmptyState />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.fav-row {
  padding-block: 0.9rem;
}

/* Offset the icon button's internal padding so the glyph aligns optically
   with the row's inline-end content edge, matching the text on the other side. */
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

  &:hover {
    background-color: rgba(var(--bs-danger-rgb), 0.1);
    color: var(--bs-danger);
  }

  &:active {
    transform: scale(0.9);
  }

  &.is-active {
    color: var(--bs-danger);
  }
}
</style>
