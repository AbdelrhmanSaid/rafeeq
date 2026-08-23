<script setup>
import { IconSearch } from '@tabler/icons-vue'
import { Input } from '@/shared/components/ui/input'
import { useSearch } from '@/shared/composables/useSearch'
import FavoriteList from '@/shared/ui/FavoriteList.vue'

const props = defineProps({
  items: { type: Array, required: true },
  searchKeys: { type: Array, default: () => ['name'] },
  itemKey: { type: String, required: true },
  favoritesKey: { type: String, required: true },
  placeholder: { type: String, default: 'ابحث' },
  searchType: { type: String, default: 'text' },
  itemClass: { type: Function, default: () => ({}) },
})

const { search, filtered } = useSearch(() => props.items, props.searchKeys)
</script>

<template>
  <div class="relative mb-5">
    <IconSearch class="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-muted-foreground" />

    <!-- The field floats on the page like the list below it; `dark:bg-card` is
         only here to cancel the tinted fill the shadcn input ships with. The
         placeholder carries the field's whole label, so it doubles as the
         accessible name. -->
    <Input
      v-model="search"
      :type="searchType"
      :placeholder="placeholder"
      :aria-label="placeholder"
      class="h-12 rounded-full border-0 bg-card ps-12 pe-4 text-base shadow-sm dark:bg-card"
    />
  </div>

  <FavoriteList
    :items="filtered"
    :search="search"
    :item-key="itemKey"
    :favorites-key="favoritesKey"
    :item-class="itemClass"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FavoriteList>
</template>
