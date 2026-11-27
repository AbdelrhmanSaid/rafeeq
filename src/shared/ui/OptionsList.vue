<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { IconCheck, IconSearch } from '@tabler/icons-vue'
import { useSearch } from '@/shared/composables/useSearch'
import { rovingTarget } from '@/shared/utils/rovingFocus'

// The radio list behind OptionsSheet (phones) and OptionsMenu (desktop), which mount it as they open.
const props = defineProps({
  label: { type: String, required: true },
  // [{ value, label, hint? }]; the hint sits muted beside the label.
  options: { type: Array, required: true },
  searchPlaceholder: { type: String, default: 'ابحث' },
  emptyMessage: { type: String, default: 'لا توجد نتائج' },
})

const model = defineModel({ type: [String, Number], default: '' })
const emit = defineEmits(['choose'])

const SEARCH_FROM = 10
const hasSearch = computed(() => props.options.length > SEARCH_FROM)

const { search, filtered } = useSearch(() => props.options, ['label'])
const list = useTemplateRef('list')
const input = useTemplateRef('input')

// Values compare as strings, so a stored "3" still finds the option whose value is 3.
const isChosen = (option) => String(option.value) === String(model.value)

const radios = () => list.value?.querySelectorAll('[role="radio"]') ?? []

// The chosen option starts in the middle of the list. Scrolled by hand: scrollIntoView would scroll the page too.
onMounted(async () => {
  await nextTick()
  const chosen = list.value?.querySelector('[aria-checked="true"]')
  if (chosen) list.value.scrollTop = chosen.offsetTop - (list.value.clientHeight - chosen.offsetHeight) / 2
})

function choose(option) {
  model.value = option.value
  emit('choose', option.value)
}

// The list is one Tab stop, on the chosen option (or the first, when a search hides it); the arrows move between
// options without choosing one, since choosing closes the list. Space or Enter chooses.
const focusIndex = ref(0)
watch(filtered, (options) => (focusIndex.value = Math.max(0, options.findIndex(isChosen))), { immediate: true })

function onListKeydown(event) {
  const to = rovingTarget(event.key, focusIndex.value, filtered.value.length)
  if (to === null) return
  event.preventDefault()
  focusIndex.value = to
  radios()[to]?.focus()
}

function focus() {
  const target = input.value ?? radios()[focusIndex.value]
  target?.focus({ preventScroll: true })
}

defineExpose({ focus })
</script>

<template>
  <div class="options" :class="{ 'options--search': hasSearch }">
    <div v-if="hasSearch" class="options__search">
      <div class="search-field">
        <IconSearch class="search-field__icon" size="1.15rem" aria-hidden="true" />
        <input
          ref="input"
          v-model="search"
          type="text"
          class="form-control search-field__input"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
        />
      </div>
    </div>

    <ul
      ref="list"
      class="bottom-sheet-list options__list"
      role="radiogroup"
      :aria-label="label"
      @keydown="onListKeydown"
    >
      <li v-for="(option, index) in filtered" :key="option.value">
        <button
          type="button"
          class="bottom-sheet-item"
          :class="{ 'is-chosen': isChosen(option) }"
          role="radio"
          :aria-checked="isChosen(option)"
          :tabindex="index === focusIndex ? 0 : -1"
          @focus="focusIndex = index"
          @click="choose(option)"
        >
          <span class="options__label">{{ option.label }}</span>
          <small v-if="option.hint" class="options__hint">{{ option.hint }}</small>
          <IconCheck v-if="isChosen(option)" size="20" class="options__check" aria-hidden="true" />
        </button>
      </li>
      <li v-if="!filtered.length" class="options__empty">{{ emptyMessage }}</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.options {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

/* A fixed height, so the list doesn't jump as the search narrows it. */
.options--search {
  height: var(--options-search-height, min(70dvh, 36rem));
}

.options__search {
  flex-shrink: 0;
  padding: 0.25rem 1rem 0.5rem;
}

.options__list {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: 0.5rem;
}

.options__label {
  flex-grow: 1;
  min-width: 0;
}

.options__hint {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
}

.bottom-sheet-item.is-chosen {
  font-weight: 600;
}

.bottom-sheet-item > .options__check {
  color: var(--app-primary-ink);
}

[data-bs-theme='dark'] .bottom-sheet-item > .options__check {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.options__empty {
  padding: 1rem;
  text-align: center;
  color: var(--bs-secondary-color);
}
</style>
