<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { IconChevronRight, IconShare3 } from '@tabler/icons-vue'
import { pageHeader } from '@/layout/pageHeader'
import { chrome } from '@/layout/chrome'
import { useBackNavigation } from '@/layout/useBackNavigation'
import { sharePage } from '@/shared/utils/share'

const route = useRoute()
const bar = useTemplateRef('bar')

const { parent, goBack } = useBackNavigation()

const hasLargeTitle = computed(() => Boolean(pageHeader.title && pageHeader.el))
const title = computed(() => pageHeader.title || route.meta.title || '')

const scrolled = ref(false)
const largeTitleHidden = ref(false)
// Only take over from a large title scrolled under the bar; a route-title fallback flashed on direct loads.
const showTitle = computed(() => Boolean(title.value) && hasLargeTitle.value && largeTitleHidden.value)

let frame = 0

function measure() {
  frame = 0
  scrolled.value = window.scrollY > 1

  const heading = pageHeader.el
  if (!heading || !bar.value) {
    largeTitleHidden.value = false
    return
  }

  largeTitleHidden.value = heading.getBoundingClientRect().bottom <= bar.value.getBoundingClientRect().bottom
}

function scheduleMeasure() {
  if (!frame) frame = requestAnimationFrame(measure)
}

useEventListener(window, 'scroll', scheduleMeasure, { passive: true })
useEventListener(window, 'resize', scheduleMeasure, { passive: true })

// Measure on the next frame, after the router has restored scroll; sooner reads the last screen's depth.
watch(
  [() => route.fullPath, () => pageHeader.el],
  () => {
    scrolled.value = false
    largeTitleHidden.value = false
    scheduleMeasure()
  },
  { immediate: true },
)
</script>

<template>
  <header ref="bar" class="app-bar" :class="{ 'is-scrolled': scrolled || chrome.overlay, 'is-hidden': chrome.hidden }">
    <div class="app-bar__inner container">
      <div class="app-bar__slot app-bar__slot--start">
        <button v-if="parent" type="button" class="app-bar__action" aria-label="رجوع" @click="goBack">
          <IconChevronRight size="1.6rem" aria-hidden="true" />
        </button>
      </div>

      <div class="app-bar__title" :class="{ 'is-visible': showTitle }" :aria-hidden="!showTitle">
        {{ title }}
      </div>

      <div class="app-bar__slot app-bar__slot--end">
        <button
          v-if="pageHeader.share"
          type="button"
          class="app-bar__action"
          aria-label="مشاركة الصفحة"
          @click="sharePage(pageHeader.title)"
        >
          <IconShare3 size="1.3rem" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-bar {
  position: sticky;
  top: 0;
  z-index: 1020;
  padding-top: env(safe-area-inset-top, 0px);
  background: transparent;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.3s var(--app-ease-out),
    opacity 0.2s ease;

  /* Inset-shadow hairline keeps the bar exactly --appbar-height tall, so full-height screens fit. */
  &.is-scrolled {
    box-shadow: inset 0 -1px 0 var(--app-hairline);
    background: var(--app-glass);
    /* Lightning CSS mishandles a paired -webkit-backdrop-filter declaration. */
    backdrop-filter: blur(18px) saturate(1.4);
  }

  &.is-hidden {
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition:
      transform 0.25s ease-in,
      opacity 0.2s ease-in,
      visibility 0s 0.25s;
  }
}

.app-bar__inner {
  display: grid;
  grid-template-columns: minmax(2.75rem, 1fr) minmax(0, auto) minmax(2.75rem, 1fr);
  align-items: center;
  height: var(--appbar-height);
  padding-inline: 0.375rem;
}

.app-bar__slot {
  display: flex;
  align-items: center;
  min-width: 0;

  &--end {
    justify-content: flex-end;
  }
}

.app-bar__action {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--bs-body-color);
  transition:
    background-color 0.15s ease,
    transform 0.15s var(--app-ease-out);

  &:active {
    background-color: var(--app-tint);
    transform: scale(0.92);
    transition-duration: 0.05s;
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

.app-bar__title {
  overflow: hidden;
  font-family: var(--bs-headings-font-family);
  font-size: 1.0625rem;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(0.375rem);
  transition:
    opacity 0.2s ease,
    transform 0.25s var(--app-ease-out);

  &.is-visible {
    opacity: 1;
    transform: none;
  }
}
</style>
