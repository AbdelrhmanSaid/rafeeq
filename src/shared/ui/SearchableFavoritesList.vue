<script setup>
import { IconSearch } from '@tabler/icons-vue'
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
  <div class="search-field form-floating mb-4">
    <input v-model="search" :type="searchType" class="form-control" :placeholder="placeholder" />
    <label>{{ label }}</label>
    <IconSearch class="search-field__icon" size="1.15rem" aria-hidden="true" />
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

<style scoped>
.search-field {
  position: relative;
}

.search-field .form-control {
  padding-inline-start: 3rem;
  border-radius: var(--bs-border-radius-lg);
  box-shadow: var(--app-shadow-card);
}

.search-field > label {
  padding-inline-start: 3rem;
}

.search-field__icon {
  position: absolute;
  top: 50%;
  inset-inline-start: 1.1rem;
  transform: translateY(-50%);
  color: var(--bs-secondary-color);
  pointer-events: none;
  transition: color 0.2s ease;
}

.search-field:focus-within .search-field__icon {
  color: var(--bs-primary);
}
</style>
