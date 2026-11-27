<script>
// Open sheets, newest last, so Escape closes only the topmost one.
const openSheets = []
let sheetId = 0
</script>

<script setup>
import { nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import { useEventListener, useScrollLock } from '@vueuse/core'
import { IconX } from '@tabler/icons-vue'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { trackSheet } from '@/shared/ui/sheetHistory'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  // Back closes the sheet rather than leaving the screen. Off for a sheet that asks whether to leave the screen.
  closeOnBack: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const id = `bottom-sheet-${++sheetId}`
const panel = useTemplateRef('panel')
const scrim = useTemplateRef('scrim')
const isPhone = useIsMobile()

const close = () => emit('close')

const bodyLock = useScrollLock(typeof document !== 'undefined' ? document.body : null)
let returnFocus = null
let untrack = null

watch(
  () => props.show,
  async (open) => {
    bodyLock.value = open

    if (open) {
      openSheets.push(id)
      if (props.closeOnBack) untrack = trackSheet(close)
      returnFocus = document.activeElement
      await nextTick()
      panel.value?.focus({ preventScroll: true })
    } else {
      forget()
      untrack?.()
      untrack = null
      // Return focus to the opener unless the user moved it. Focus still in the leaving panel counts as not moved:
      // left there, it would drop to <body> once the panel goes.
      const active = document.activeElement
      const stillInside = !active || active === document.body || panel.value?.contains(active)
      if (returnFocus?.isConnected && stillInside) returnFocus.focus({ preventScroll: true })
      returnFocus = null
    }
  },
  { immediate: true },
)

function forget() {
  const index = openSheets.indexOf(id)
  if (index !== -1) openSheets.splice(index, 1)
}

onBeforeUnmount(() => {
  bodyLock.value = false
  forget()
  untrack?.()
})

useEventListener(document, 'keydown', (event) => {
  if (!props.show || openSheets.at(-1) !== id) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  } else if (event.key === 'Tab') {
    trapFocus(event)
  }
})

// Tab cycles inside the sheet. The next stop is chosen here: with a roving tabindex (one option at 0, the rest at -1)
// the browser could send Tab past the sheet's end.
const TABBABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]'

const isTabbable = (el) =>
  el.tabIndex >= 0 &&
  !el.closest('[inert]') &&
  (el.checkVisibility ? el.checkVisibility({ visibilityProperty: true }) : el.getClientRects().length > 0)

function trapFocus(event) {
  event.preventDefault()
  const stops = [...panel.value.querySelectorAll(TABBABLE)].filter(isTabbable)
  if (!stops.length) return panel.value.focus({ preventScroll: true })

  const active = document.activeElement
  let index = stops.indexOf(active)
  // Focus on something that isn't a stop (the panel, an option at -1): step from where it sits in the sheet.
  if (index === -1) {
    const after = stops.findIndex((el) => active?.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
    const inside = panel.value.contains(active) && active !== panel.value
    if (!inside) index = event.shiftKey ? 0 : -1
    else if (event.shiftKey) index = after === -1 ? stops.length : after
    else index = after === -1 ? stops.length - 1 : after - 1
  }

  const next = (index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length
  stops[next].focus()
}

// Drag to dismiss on phones. A gesture drags the sheet when nothing under the finger can scroll, or the content is at
// its top and the finger moves down. Letting go past a quarter of the sheet, or a flick, closes it.
const scrolls = (node) => node.scrollHeight > node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)

let start = null
let startTime = 0
let lastY = 0
let lastTime = 0
let velocity = 0
let offset = 0
let mode = null
let scroller = null

function setScrim(opacity, transition) {
  if (!scrim.value) return
  scrim.value.style.transition = transition
  scrim.value.style.opacity = opacity
}

function settle() {
  const sheet = panel.value
  if (!sheet) return
  sheet.style.transition = 'translate 0.4s var(--app-ease-sheet)'
  sheet.style.translate = ''
  setScrim('', 'opacity 0.4s var(--app-ease-sheet)')
}

function onTouchStart(event) {
  if (!isPhone.value || event.touches.length > 1) return
  // Sliders own their horizontal drags.
  if (event.target.closest?.('input[type="range"]')) return

  start = lastY = event.touches[0].clientY
  startTime = lastTime = event.timeStamp
  mode = null
  offset = velocity = 0

  scroller = event.target instanceof Element ? event.target : null
  while (scroller && scroller !== panel.value && !scrolls(scroller)) scroller = scroller.parentElement
  if (scroller === panel.value) scroller = null
}

function onTouchMove(event) {
  if (start === null) return

  const y = event.touches[0].clientY
  if (mode === null) mode = scroller && (scroller.scrollTop > 0 || y < start) ? 'scroll' : 'drag'
  if (mode === 'scroll') return

  event.preventDefault()

  velocity = (y - lastY) / Math.max(event.timeStamp - lastTime, 1)
  lastY = y
  lastTime = event.timeStamp
  // Pulling up rubber-bands toward a 24px limit, giving less the further it goes.
  offset = y < start ? -24 * (1 - 1 / (1 + (start - y) / 120)) : y - start

  const sheet = panel.value
  sheet.style.transition = 'none'
  sheet.style.translate = `0 ${offset}px`
  setScrim(String(1 - Math.max(0, offset) / sheet.offsetHeight), 'none')
}

function onTouchEnd(event) {
  if (start === null) return

  // A flick is judged over the whole drag, so a quick swipe closes it but a tap's jitter does not.
  const speed = offset / Math.max(event.timeStamp - startTime, 1)
  const flick = offset > 16 && speed > 0.11 && velocity > 0
  const dismiss = mode === 'drag' && (offset > panel.value.offsetHeight / 4 || flick)
  const dragged = mode === 'drag'

  start = null

  if (dismiss) {
    // The sheet keeps its offset, so the exit transform slides it on from where it was let go.
    panel.value.style.transition = ''
    setScrim('0', 'opacity 0.25s var(--app-ease-sheet)')
    close()
  } else if (dragged) {
    settle()
  }
}

// Drop the settle transition once done, so it cannot override the exit transition later.
function onTransitionEnd(event) {
  if (event.target === panel.value && event.propertyName === 'translate') panel.value.style.transition = ''
}

function onTouchCancel() {
  if (start === null) return
  start = null
  settle()
}

// Vue binds touchmove passively, so only a native listener can stop the page from scrolling.
useEventListener(panel, 'touchstart', onTouchStart, { passive: true })
useEventListener(panel, 'touchmove', onTouchMove, { passive: false })
useEventListener(panel, 'touchend', onTouchEnd)
useEventListener(panel, 'touchcancel', onTouchCancel)
useEventListener(panel, 'transitionend', onTransitionEnd)
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet" :duration="{ enter: 400, leave: 250 }">
      <div v-if="show" class="sheet-root">
        <div ref="scrim" class="sheet-scrim" aria-hidden="true" @click="close"></div>

        <div
          ref="panel"
          class="sheet"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? `${id}-title` : undefined"
          tabindex="-1"
        >
          <span class="sheet-grip" aria-hidden="true"></span>

          <header class="sheet-header">
            <h2 v-if="title" :id="`${id}-title`" class="sheet-title">{{ title }}</h2>
            <button type="button" class="btn sheet-close" aria-label="إغلاق" @click="close">
              <IconX size="1.125rem" />
            </button>
          </header>

          <div class="sheet-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.sheet-root {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet-scrim {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  /* The finger owns this area while a sheet is open; nothing behind it should scroll. */
  touch-action: none;
}

.sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 85vh;
  max-height: 85dvh;
  border-radius: var(--bs-border-radius-xl) var(--bs-border-radius-xl) 0 0;
  background-color: var(--app-surface);
  box-shadow: 0 -12px 40px -12px rgba(0, 0, 0, 0.25);
  outline: none;

  /* Fills in below the sheet while it rubber-bands up off the bottom edge. */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    inset-inline: 0;
    height: 1.5rem;
    background-color: inherit;
  }
}

.sheet-grip {
  flex-shrink: 0;
  width: 2.25rem;
  height: 0.3125rem;
  margin: 0.5rem auto 0;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--bs-body-color) 18%, transparent);
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  min-height: 3rem;
  padding: 0.5rem 1.25rem 0.25rem;
  user-select: none;
  -webkit-user-select: none;
}

.sheet-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-close {
  --bs-btn-bg: rgba(var(--bs-secondary-rgb), 0.12);
  --bs-btn-hover-bg: rgba(var(--bs-secondary-rgb), 0.2);
  --bs-btn-active-bg: rgba(var(--bs-secondary-rgb), 0.24);
  --bs-btn-border-color: transparent;
  --bs-btn-hover-border-color: transparent;
  --bs-btn-active-border-color: transparent;
  --bs-btn-color: var(--bs-secondary-color);
  --bs-btn-hover-color: var(--bs-body-color);
  --bs-btn-active-color: var(--bs-body-color);

  /* A 32px circle inside a 44px target. */
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  margin: -0.375rem;
  margin-inline-start: auto;
  padding: 0.375rem;
  border-radius: 50%;
  background-clip: content-box;
}

.sheet-body {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Clear the home indicator. */
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
}

/* Phones close it by swipe, Escape or a tap outside; the close button stays for screen readers. */
@media (max-width: 991.98px) {
  .sheet-close {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;

    &:focus-visible {
      position: static;
      width: 2.75rem;
      height: 2.75rem;
      clip: auto;
    }
  }
}

@media (min-width: 992px) {
  .sheet-root {
    align-items: center;
    padding: 1.5rem;
  }

  .sheet {
    max-width: 30rem;
    max-height: min(40rem, 85vh);
    border: 1px solid var(--app-hairline);
    border-radius: var(--bs-border-radius-xl);
    box-shadow: 0 24px 64px -16px rgba(0, 0, 0, 0.35);

    &::after {
      content: none;
    }
  }

  .sheet-grip {
    display: none;
  }

  .sheet-header {
    padding: 1rem 1.25rem 0.5rem;
  }

  .sheet-body {
    padding-bottom: 0.75rem;
  }
}

.sheet-enter-active .sheet-scrim {
  transition: opacity 0.4s var(--app-ease-sheet);
}

.sheet-leave-active .sheet-scrim {
  transition: opacity 0.25s var(--app-ease-sheet);
}

.sheet-enter-from .sheet-scrim,
.sheet-leave-to .sheet-scrim {
  opacity: 0;
}

.sheet-enter-active .sheet {
  transition: transform 0.4s var(--app-ease-sheet);
}

.sheet-leave-active .sheet {
  transition: transform 0.25s var(--app-ease-sheet);
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}

@media (min-width: 992px) {
  .sheet-enter-active .sheet {
    transition:
      transform 0.25s var(--app-ease-out),
      opacity 0.25s var(--app-ease-out);
  }

  .sheet-leave-active .sheet {
    transition:
      transform 0.15s ease-in,
      opacity 0.15s ease-in;
  }

  .sheet-enter-from .sheet,
  .sheet-leave-to .sheet {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
