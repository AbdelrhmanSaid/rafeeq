<script setup>
import { computed } from 'vue'
import { IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { useFavorites } from '@/composables/favorites'
import EmptyState from '@/components/EmptyState.vue'

const props = defineProps({
  items: { type: Array, required: true },
  search: { type: String, default: '' },
  itemKey: { type: String, required: true },
  favoritesKey: { type: String, required: true },
  itemClass: { type: Function, default: () => ({}) },
})

defineSlots()

const { isFavorite, toggleFavorite, filterFavorites } = useFavorites(props.favoritesKey)
const getKey = (item) => item[props.itemKey]
const favorites = filterFavorites(
  computed(() => props.items),
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
        class="list-group-item list-group-item-action py-3"
        :class="itemClass(item)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <slot :item="item" :index="index" />

          <div class="d-flex gap-2">
            <button
              class="btn btn-flat position-relative z-1"
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
      class="list-group-item list-group-item-action py-3"
      :class="itemClass(item)"
    >
      <div class="d-flex justify-content-between align-items-center">
        <slot :item="item" :index="index" />

        <div class="d-flex gap-2">
          <button
            class="btn btn-flat position-relative z-1"
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
