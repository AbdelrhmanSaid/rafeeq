<script setup>
import { IconHeart, IconHeartFilled } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
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
    <ul class="divide-y overflow-hidden rounded-xl border">
      <li
        v-for="(item, index) in favorites"
        :key="getKey(item)"
        class="px-4 py-3 transition-colors hover:bg-secondary [&.active]:bg-primary/10"
        :class="itemClass(item)"
      >
        <div class="flex items-center justify-between gap-3">
          <slot :item="item" :index="index" />

          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              class="relative z-[1]"
              @click.stop="toggleFavorite(getKey(item))"
              title="إزالة من المفضلة"
            >
              <IconHeartFilled class="size-5 text-destructive" />
            </Button>

            <slot name="actions" :item="item" />
          </div>
        </div>
      </li>
    </ul>
  </div>

  <slot v-if="favorites.length && !search" name="all-title" />
  <ul class="divide-y overflow-hidden rounded-xl border">
    <li
      v-for="(item, index) in items"
      :key="getKey(item)"
      class="px-4 py-3 transition-colors hover:bg-secondary [&.active]:bg-primary/10"
      :class="itemClass(item)"
    >
      <div class="flex items-center justify-between gap-3">
        <slot :item="item" :index="index" />

        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="relative z-[1]"
            @click.stop="toggleFavorite(getKey(item))"
            :title="isFavorite(getKey(item)) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
          >
            <IconHeartFilled v-if="isFavorite(getKey(item))" class="size-5 text-destructive" />
            <IconHeart v-else class="size-5" />
          </Button>

          <slot name="actions" :item="item" />
        </div>
      </div>
    </li>

    <li v-if="items.length === 0" class="px-4">
      <EmptyState />
    </li>
  </ul>
</template>
