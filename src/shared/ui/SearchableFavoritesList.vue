<script setup>
import { useSearch } from '@/shared/composables/useSearch'
import FavoriteList from '@/shared/ui/FavoriteList.vue'

const props = defineProps({
  items: { type: Array, required: true },
  searchKeys: { type: Array, default: () => ['name'] },
  itemKey: { type: String, required: true },
  favoritesKey: { type: String, required: true },
  placeholder: { type: String, default: 'ابحث' },
  label: { type: String, default: 'تبحث عن شيء معين؟' },
  searchType: { type: String, default: 'text' },
  itemClass: { type: Function, default: () => ({}) },
})

const { search, filtered } = useSearch(() => props.items, props.searchKeys)
</script>

<template>
  <div class="form-floating mb-4">
    <input v-model="search" :type="searchType" class="form-control" :placeholder="placeholder" />
    <label>{{ label }}</label>
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
