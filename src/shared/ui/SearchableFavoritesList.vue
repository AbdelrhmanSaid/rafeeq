<script setup>
import { useSlots, useTemplateRef } from 'vue'
import { IconSearch, IconX } from '@tabler/icons-vue'
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

// `before-list` is this component's own slot (content between the search field and the list); the rest pass through.
const slots = useSlots()
// A function, not a computed: slots aren't reactive, so it's read afresh on every render.
const listSlots = () => Object.keys(slots).filter((name) => name !== 'before-list')
const input = useTemplateRef('input')

const clearSearch = () => {
  search.value = ''
  input.value?.focus()
}
</script>

<template>
  <div class="search-field mb-3">
    <IconSearch class="search-field__icon" size="1.15rem" aria-hidden="true" />
    <input
      ref="input"
      v-model="search"
      :type="searchType"
      class="form-control search-field__input"
      :class="{ 'has-clear': search }"
      :placeholder="placeholder"
      :aria-label="label"
    />
    <!-- One clear button for every search field; the browser's own (on type="search") is hidden below. -->
    <button v-if="search" type="button" class="search-field__clear" aria-label="مسح البحث" @click="clearSearch">
      <IconX size="1rem" aria-hidden="true" />
    </button>
  </div>

  <slot name="before-list" :search="search" />

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
    <template v-for="name in listSlots()" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </FavoriteList>
</template>

<style lang="scss" scoped>
.search-field__input {
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }

  &.has-clear {
    padding-inline-end: 2.75rem;
  }
}

.search-field__clear {
  position: absolute;
  top: 50%;
  inset-inline-end: 0.25rem;
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--bs-secondary-color);
  transform: translateY(-50%);

  /* A small filled disc behind the ✕, like the system clear button, sized for a thumb. */
  &::before {
    content: '';
    position: absolute;
    width: 1.375rem;
    height: 1.375rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--bs-body-color) 12%, transparent);
  }

  svg {
    position: relative;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--bs-body-color);
    }
  }
}
</style>
