<script setup>
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { onClickOutside, useEventListener } from '@vueuse/core'
import OptionsList from '@/shared/ui/OptionsList.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  anchor: { type: Object, default: null },
  title: { type: String, required: true },
  options: { type: Array, required: true },
})

const model = defineModel({ type: [String, Number], default: '' })
const emit = defineEmits(['close'])

const menu = useTemplateRef('menu')
const list = useTemplateRef('list')

const MARGIN = 8
const GAP = 4
const WIDTH = 320
const MAX_HEIGHT = 352
const ROW_HEIGHT = 40

const style = ref({})
const up = ref(false)

const wantedHeight = () => (props.options.length > 10 ? MAX_HEIGHT : props.options.length * ROW_HEIGHT + 16)

function place() {
  const anchor = props.anchor
  if (!anchor) return
  const rect = anchor.getBoundingClientRect()
  const { innerWidth: vw, innerHeight: vh } = window

  const below = vh - rect.bottom - GAP - MARGIN
  const above = rect.top - GAP - MARGIN
  up.value = below < Math.min(wantedHeight(), MAX_HEIGHT) && above > below
  const height = Math.max(0, Math.min(MAX_HEIGHT, up.value ? above : below))

  const width = Math.min(WIDTH, vw - 2 * MARGIN)
  const rtl = getComputedStyle(anchor).direction === 'rtl'
  const left = Math.min(Math.max(rtl ? rect.left : rect.right - width, MARGIN), vw - MARGIN - width)

  style.value = {
    'left': `${left}px`,
    'width': `${width}px`,
    '--menu-height': `${height}px`,
    ...(up.value ? { bottom: `${vh - rect.top + GAP}px` } : { top: `${rect.bottom + GAP}px` }),
  }
}

watch(
  () => props.show,
  async (open) => {
    if (!open) return
    place()
    await nextTick()
    list.value?.focus()
  },
  { immediate: true },
)

useEventListener(window, 'resize', () => props.show && place())
useEventListener(window, 'scroll', () => props.show && place(), { capture: true, passive: true })

function close({ refocus = true } = {}) {
  emit('close')
  if (refocus) props.anchor?.focus({ preventScroll: true })
}

// The row toggles the menu itself, so a click on it isn't a click outside.
onClickOutside(menu, () => props.show && close({ refocus: false }), { ignore: [() => props.anchor] })

// Handled here and stopped, so a sheet the row sits in doesn't close too, or take Tab for its own focus loop.
function onKeydown(event) {
  if (event.key !== 'Escape' && event.key !== 'Tab') return
  event.preventDefault()
  event.stopPropagation()
  close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="options-menu">
      <div
        v-if="show"
        ref="menu"
        class="options-menu"
        :class="{ 'options-menu--up': up }"
        role="dialog"
        :aria-label="title"
        :style="style"
        @keydown="onKeydown"
      >
        <OptionsList ref="list" v-model="model" :label="title" :options="options" @choose="close()" />
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.options-menu {
  /* Above a sheet, which a select can sit in (the tafsir's). */
  position: fixed;
  z-index: 1060;
  display: flex;
  flex-direction: column;
  max-height: var(--menu-height);
  --options-search-height: calc(var(--menu-height) - 2px);
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-lg);
  background: var(--app-surface);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.3);
  transform-origin: top;

  &--up {
    transform-origin: bottom;
  }

  :deep(.options__search) {
    padding: 0.5rem 0.5rem 0.25rem;
  }

  :deep(.bottom-sheet-item) {
    min-height: 2.5rem;
    font-size: 0.9375rem;
  }
}

.options-menu-enter-active {
  transition:
    opacity 0.15s var(--app-ease-out),
    transform 0.15s var(--app-ease-out);
}

.options-menu-leave-active {
  transition: opacity 0.1s ease-in;
}

.options-menu-enter-from {
  opacity: 0;
  transform: scale(0.97);
}

.options-menu-leave-to {
  opacity: 0;
}
</style>
