<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useEventListener, useMediaQuery, useScrollLock } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'
import { IconX } from '@tabler/icons-vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const bodyLock = useScrollLock(typeof document !== 'undefined' ? document.body : null)
watch(
  () => props.show,
  (open) => (bodyLock.value = open),
  { immediate: true },
)
onBeforeUnmount(() => (bodyLock.value = false))

const dragY = ref(0)
const dragging = ref(false)
let dragStartY = 0
let dragStartTime = 0
let releasedY = 0

const isDesktop = useMediaQuery('(min-width: 992px)')

function onDragStart(event) {
  if (isDesktop.value) return

  dragging.value = true
  dragY.value = 0
  dragStartY = event.clientY
  dragStartTime = performance.now()
}

function onDragMove(event) {
  if (!dragging.value) return
  dragY.value = Math.max(0, event.clientY - dragStartY)
}

function onDragEnd() {
  if (!dragging.value) return

  const elapsed = Math.max(1, performance.now() - dragStartTime)
  const velocity = dragY.value / elapsed
  const shouldDismiss = dragY.value > 90 || (velocity > 0.5 && dragY.value > 30)

  releasedY = shouldDismiss ? dragY.value : 0
  dragging.value = false
  dragY.value = 0
  if (shouldDismiss) emit('close')
}

useEventListener(window, 'pointermove', onDragMove)
useEventListener(window, 'pointerup', onDragEnd)
useEventListener(window, 'pointercancel', onDragEnd)

// Match Vue's double-rAF leave timing so a dragged panel does not snap before sliding out.
function onLeave(el) {
  if (!releasedY) return
  const panel = el.querySelector('.bottom-sheet')
  el.style.opacity = String(backdropOpacity(releasedY))
  panel.style.transform = `translateY(${releasedY}px)`
  releasedY = 0
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      el.style.opacity = ''
      el.style.transition = ''
      panel.style.transform = ''
      panel.style.transition = ''
    }),
  )
}

const backdropOpacity = (y) => Math.max(0.35, 1 - y / 400)

const panelStyle = computed(() =>
  dragging.value && dragY.value > 0 ? { transform: `translateY(${dragY.value}px)`, transition: 'none' } : undefined,
)

const overlayStyle = computed(() =>
  dragging.value && dragY.value > 0 ? { opacity: String(backdropOpacity(dragY.value)), transition: 'none' } : undefined,
)

const close = () => emit('close')
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet" @leave="onLeave">
      <div
        v-if="show"
        class="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-end bottom-sheet-overlay"
        :style="overlayStyle"
      >
        <!-- Ignore clicks from toasts rendered above the backdrop. -->
        <div
          class="bg-body rounded-top-3 bottom-sheet"
          :style="panelStyle"
          v-on-click-outside="[close, { ignore: ['[data-sonner-toaster]'] }]"
        >
          <!-- .prevent would suppress the close button's touch-generated click. -->
          <div class="bottom-sheet-handle" @pointerdown="onDragStart">
            <span class="bottom-sheet-grip d-lg-none" aria-hidden="true"></span>
            <div class="d-flex justify-content-between align-items-center px-3 pb-3 pt-2 border-bottom">
              <h5 class="mb-0">{{ title }}</h5>
              <button class="btn btn-sm" @click="close" aria-label="إغلاق">
                <IconX size="1.25rem" />
              </button>
            </div>
          </div>

          <div class="bottom-sheet-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.bottom-sheet-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.bottom-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 85vh;
  max-height: 85dvh;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.bottom-sheet-handle {
  /* Reserve vertical pointer gestures for drag-to-dismiss. */
  touch-action: none;
  user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.bottom-sheet-grip {
  display: block;
  width: 2.5rem;
  height: 0.3rem;
  margin: 0.6rem auto 0.4rem;
  border-radius: 999px;
  background: rgba(var(--bs-secondary-rgb), 0.3);
}

.bottom-sheet-body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease-out;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-active .bottom-sheet,
.sheet-leave-active .bottom-sheet {
  transition: transform 0.3s ease-out;
}

.sheet-enter-from .bottom-sheet,
.sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}

@media (min-width: 992px) {
  .bottom-sheet-overlay {
    align-items: center !important;
    justify-content: center;
    padding: 1rem;
  }

  .bottom-sheet {
    max-width: 500px;
    border-radius: var(--bs-border-radius-xl) !important;
  }

  .bottom-sheet-handle {
    touch-action: auto;
    cursor: auto;

    &:active {
      cursor: auto;
    }
  }

  .sheet-leave-active {
    transition: opacity 0.18s ease-in;
  }

  .sheet-enter-active .bottom-sheet {
    transition:
      transform 0.3s cubic-bezier(0.34, 1.32, 0.64, 1),
      opacity 0.3s ease-out;
  }

  .sheet-leave-active .bottom-sheet {
    transition:
      transform 0.18s ease-in,
      opacity 0.18s ease-in;
  }

  .sheet-enter-from .bottom-sheet,
  .sheet-leave-to .bottom-sheet {
    opacity: 0;
  }

  .sheet-enter-from .bottom-sheet {
    transform: translateY(20px) scale(0.96);
  }

  .sheet-leave-to .bottom-sheet {
    transform: translateY(10px) scale(0.97);
  }
}
</style>
