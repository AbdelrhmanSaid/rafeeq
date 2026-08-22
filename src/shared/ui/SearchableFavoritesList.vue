<script setup>
import { useId } from 'vue'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
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

// The label is bound to its own input by id, so several lists can share a page.
const searchId = useId()

const { search, filtered } = useSearch(() => props.items, props.searchKeys)
</script>

<template>
  <div class="mb-4 grid gap-2">
    <Label :for="searchId">{{ label }}</Label>
    <Input :id="searchId" v-model="search" :type="searchType" :placeholder="placeholder" class="h-11" />
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
