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

const listClass = 'divide-y overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm'

const rowClass = [
  'relative flex min-h-11 items-center justify-between gap-3 px-4 py-3 transition-colors',
  'hover:bg-accent/60 active:bg-accent',
  '[&.active]:bg-primary/10 [&.active]:text-primary',
  '[&.active]:before:absolute [&.active]:before:inset-y-2 [&.active]:before:start-0 [&.active]:before:w-1',
  '[&.active]:before:rounded-e-full [&.active]:before:bg-primary',
].join(' ')

const favoriteButtonClass = 'relative z-1 size-11 shrink-0 rounded-full active:scale-90'
</script>
<template>
  <div v-if="favorites.length && !search" class="mb-6">
    <slot name="favorites-title" />
    <ul :class="listClass">
      <li v-for="(item, index) in favorites" :key="getKey(item)" :class="[rowClass, itemClass(item)]">
        <slot :item="item" :index="index" />
        <div class="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            :class="favoriteButtonClass"
            @click.stop="toggleFavorite(getKey(item))"
            title="إزالة من المفضلة"
          >
            <IconHeartFilled class="size-5 text-destructive" />
          </Button>
          <slot name="actions" :item="item" />
        </div>
      </li>
    </ul>
  </div>
  <slot v-if="favorites.length && !search" name="all-title" />
  <ul :class="listClass">
    <li v-for="(item, index) in items" :key="getKey(item)" :class="[rowClass, itemClass(item)]">
      <slot :item="item" :index="index" />
      <div class="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          :class="favoriteButtonClass"
          @click.stop="toggleFavorite(getKey(item))"
          :title="isFavorite(getKey(item)) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
        >
          <IconHeartFilled v-if="isFavorite(getKey(item))" class="size-5 text-destructive" />
          <IconHeart v-else class="size-5 text-muted-foreground" />
        </Button>
        <slot name="actions" :item="item" />
      </div>
    </li>
    <li v-if="items.length === 0">
      <EmptyState />
    </li>
  </ul>
</template>
