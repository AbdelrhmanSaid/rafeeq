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

// Lock the background page scroll while the sheet is open so the backdrop
// stays put instead of scrolling behind the panel.
const bodyLock = useScrollLock(typeof document !== 'undefined' ? document.body : null)
watch(
  () => props.show,
  (open) => (bodyLock.value = open),
  { immediate: true },
)
onBeforeUnmount(() => (bodyLock.value = false))

// --- Drag-to-dismiss -------------------------------------------------------
// Dragging is anchored to the grip/header only: dragging from the body would
// fight with the sheet's own scrolling. The panel follows the finger, then
// either springs back or dismisses based on distance and release velocity.
const dragY = ref(0)
const dragging = ref(false)
let dragStartY = 0
let dragStartTime = 0
let releasedY = 0 // where a dismissing drag let go, so the leave slide continues from there

// ≥ lg the sheet is a centered dialog (see the media query below) — dragging
// it downward would just look broken.
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
  const velocity = dragY.value / elapsed // px per ms
  const shouldDismiss = dragY.value > 90 || (velocity > 0.5 && dragY.value > 30)

  releasedY = shouldDismiss ? dragY.value : 0
  dragging.value = false
  dragY.value = 0
  if (shouldDismiss) emit('close')
}

// Registered once for the component's lifetime — the `dragging` guards above
// make them no-ops outside a drag, and unmounting mid-drag cleans up for free.
useEventListener(window, 'pointermove', onDragMove)
useEventListener(window, 'pointerup', onDragEnd)
useEventListener(window, 'pointercancel', onDragEnd)

// Without this the panel snaps back to the top of the drag before the leave
// transition slides it down. Seed the leave with the release position, then
// hand off to the CSS transition. Two constraints on the handoff:
// - Vue applies .sheet-leave-to on its own double rAF, so ours must be a
//   double rAF too — a single frame clears the seed before the target class
//   exists and flashes the fully-open sheet.
// - The unmounting element never gets its final :style patch, so the drag's
//   inline `transition: none` is still on both nodes and must be cleared or
//   the dismissal jumps instead of sliding.
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

// Backdrop opacity for a given drag distance — dims as the panel travels so
// the dismissal reads as one continuous motion.
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
        <!-- Toasts render above the backdrop (vue-sonner's z-index), so a tap
             dismissing a toast must not also dismiss the sheet. -->
        <div
          class="bg-body rounded-top-3 bottom-sheet"
          :style="panelStyle"
          v-on-click-outside="[close, { ignore: ['[data-sonner-toaster]'] }]"
        >
          <!-- No .prevent here: canceling pointerdown would also suppress the
               compatibility click on touch, breaking the close button. -->
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
  /* dvh (not vh) so the cap tracks the visible viewport with the URL bar open. */
  max-height: 85vh;
  max-height: 85dvh;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.bottom-sheet-handle {
  /* The handle owns the vertical drag — without this the browser claims the
     gesture for scrolling and pointermove never fires. */
  touch-action: none;
  /* Drags across the title must not start a text selection. */
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
  /* Don't chain the sheet's scroll into the locked page behind it. */
  overscroll-behavior: contain;
}

/* <Transition name="sheet"> — overlay fades, panel slides up from the bottom. */
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

/* Desktop (>= lg): center it and swap the slide for a soft fade + scale. */
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
    /* Slightly-overshooting deceleration so the panel settles in place. */
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
