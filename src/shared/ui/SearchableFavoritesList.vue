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
  groups: { type: Array, default: null },
  groupKey: { type: String, default: 'category' },
  itemLabel: { type: Function, default: null },
})

const { search, filtered } = useSearch(() => props.items, props.searchKeys)
</script>

<template>
  <div class="search-field mb-3">
    <IconSearch class="search-field__icon" size="1.15rem" aria-hidden="true" />
    <input
      v-model="search"
      :type="searchType"
      class="form-control search-field__input"
      :placeholder="placeholder"
      :aria-label="label"
    />
  </div>

  <FavoriteList
    :items="filtered"
    :search="search"
    :item-key="itemKey"
    :favorites-key="favoritesKey"
    :item-class="itemClass"
    :groups="groups"
    :group-key="groupKey"
    :item-label="itemLabel"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FavoriteList>
</template>

<style lang="scss" scoped>
/* A short filled bar, like a native search field, instead of a tall floating-label input. */
.search-field {
  position: relative;
}

.search-field__input {
  height: 2.5rem;
  padding-block: 0;
  padding-inline: 2.5rem 0.875rem;
  border-color: var(--app-hairline);
  border-radius: var(--bs-border-radius);
  background-color: color-mix(in srgb, var(--bs-body-color) 6%, transparent);

  &::placeholder {
    color: var(--bs-secondary-color);
  }

  &:focus {
    border-color: var(--app-hairline);
    background-color: color-mix(in srgb, var(--bs-body-color) 6%, transparent);
  }
}

.search-field__icon {
  position: absolute;
  top: 50%;
  inset-inline-start: 0.875rem;
  z-index: 1;
  transform: translateY(-50%);
  color: var(--bs-secondary-color);
  pointer-events: none;
}
</style>
