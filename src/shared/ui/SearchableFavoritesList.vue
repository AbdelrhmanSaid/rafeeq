<script setup>
import { computed, useTemplateRef } from 'vue'
import { IconHeart, IconHeartFilled, IconSearch, IconX } from '@tabler/icons-vue'
import { useFavorites } from '@/shared/composables/useFavorites'
import { useSearch } from '@/shared/composables/useSearch'
import StatePanel from '@/shared/ui/StatePanel.vue'

const props = defineProps({
  items: { type: Array, required: true },
  searchKeys: { type: Array, default: () => ['name'] },
  itemKey: { type: String, required: true },
  favoritesKey: { type: String, required: true },
  placeholder: { type: String, default: 'ابحث' },
  label: { type: String, default: 'تبحث عن شيء معين؟' },
  searchType: { type: String, default: 'text' },
  itemClass: { type: Function, default: () => ({}) },
  // Optional sections, as [{ key, title }]; each item goes in the section named by its `category`.
  groups: { type: Array, default: null },
  itemLabel: { type: Function, required: true },
})

const { search, filtered } = useSearch(() => props.items, props.searchKeys)
const { isFavorite, toggleFavorite, filterFavorites } = useFavorites(props.favoritesKey)
const input = useTemplateRef('input')

const getKey = (item) => item[props.itemKey]
const favorites = filterFavorites(filtered, getKey)

const favoriteLabel = (item) => {
  const name = props.itemLabel(item)
  return isFavorite(getKey(item)) ? `إزالة ${name} من المفضلة` : `إضافة ${name} للمفضلة`
}

const sections = computed(() => {
  if (!props.groups) return [{ key: 'all', title: null, items: filtered.value }]

  return props.groups
    .map((group) => ({ ...group, items: filtered.value.filter((item) => item.category === group.key) }))
    .filter((group) => group.items.length)
})

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
    <!-- Replaces the browser's own clear button on type="search", hidden below. -->
    <button v-if="search" type="button" class="search-field__clear" aria-label="مسح البحث" @click="clearSearch">
      <IconX size="1rem" aria-hidden="true" />
    </button>
  </div>

  <slot name="before-list" :search="search" />

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

          <div class="d-flex gap-1 fav-actions">
            <button
              class="btn btn-flat btn-icon fav-btn is-active position-relative z-1"
              @click.stop="toggleFavorite(getKey(item))"
              title="إزالة من المفضلة"
              :aria-label="favoriteLabel(item)"
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
  <div v-for="section in sections" :key="section.key" class="fav-section">
    <h2 v-if="section.title" class="list-title">{{ section.title }}</h2>
    <ul class="list-group">
      <li
        v-for="(item, index) in section.items"
        :key="getKey(item)"
        class="list-group-item list-group-item-action fav-row"
        :class="itemClass(item)"
      >
        <div class="d-flex justify-content-between align-items-center">
          <slot :item="item" :index="index" />

          <div class="d-flex gap-1 fav-actions">
            <button
              class="btn btn-flat btn-icon fav-btn position-relative z-1"
              :class="{ 'is-active': isFavorite(getKey(item)) }"
              @click.stop="toggleFavorite(getKey(item))"
              :title="isFavorite(getKey(item)) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'"
              :aria-label="favoriteLabel(item)"
            >
              <IconHeartFilled v-if="isFavorite(getKey(item))" size="1.25rem" class="text-danger" />
              <IconHeart v-else size="1.25rem" />
            </button>

            <slot name="actions" :item="item" />
          </div>
        </div>
      </li>
    </ul>
  </div>

  <ul v-if="filtered.length === 0" class="list-group">
    <li class="list-group-item">
      <StatePanel :icon="IconSearch" title="لا توجد نتائج" message="جرّب كلمة أخرى." />
    </li>
  </ul>
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

  /* A small filled disc behind the ✕, like the system clear button, in a thumb-sized target. */
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

/* The 44px action buttons set the row height; list actions default to the muted colour, the name reads in full. */
.fav-row {
  --bs-list-group-action-color: var(--bs-body-color);
  padding-block: 0.375rem;
}

.fav-row :deep(.list-index) {
  width: 2rem;
  height: 2rem;
  font-size: 0.8125rem;
}

.fav-section + .fav-section {
  margin-top: 1.5rem;
}

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

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: rgba(var(--bs-danger-rgb), 0.1);
      color: var(--bs-danger);
    }
  }

  &:active {
    transform: scale(0.9);
  }

  &.is-active {
    color: var(--bs-danger);
  }
}
</style>
