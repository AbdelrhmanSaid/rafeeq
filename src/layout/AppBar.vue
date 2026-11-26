<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEventListener } from '@vueuse/core'
import { IconChevronRight, IconShare3 } from '@tabler/icons-vue'
import { pageHeader } from '@/layout/pageHeader'
import { useBackNavigation } from '@/layout/useBackNavigation'
import { sharePage } from '@/shared/utils/share'

const route = useRoute()
const bar = useTemplateRef('bar')

const { parent, goBack } = useBackNavigation()

// A page with a large title hands it to the bar once it scrolls away; other pages show theirs from the start.
const hasLargeTitle = computed(() => Boolean(pageHeader.title && pageHeader.el))
const title = computed(() => pageHeader.title || route.meta.title || '')

const scrolled = ref(false)
const largeTitleHidden = ref(false)
const showTitle = computed(() => Boolean(title.value) && (!hasLargeTitle.value || largeTitleHidden.value))

let frame = 0

function measure() {
  frame = 0
  scrolled.value = window.scrollY > 1

  const heading = pageHeader.el
  if (!heading || !bar.value) {
    largeTitleHidden.value = false
    return
  }

  // Swap once the large title's baseline passes under the bar.
  largeTitleHidden.value = heading.getBoundingClientRect().bottom <= bar.value.getBoundingClientRect().bottom
}

function scheduleMeasure() {
  if (!frame) frame = requestAnimationFrame(measure)
}

useEventListener(window, 'scroll', scheduleMeasure, { passive: true })
useEventListener(window, 'resize', scheduleMeasure, { passive: true })

watch([() => route.fullPath, () => pageHeader.el], () => nextTick(measure), { immediate: true })
</script>

<template>
  <header ref="bar" class="app-bar" :class="{ 'is-scrolled': scrolled }">
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
  /* Sit below the status bar / notch in a standalone or store build. */
  padding-top: env(safe-area-inset-top, 0px);
  background: transparent;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  /* Glass only once content slides under it, so the top of each page stays one clean surface.
     The hairline is an inset shadow, so the bar stays exactly --appbar-height tall and full-height screens fit. */
  &.is-scrolled {
    box-shadow: inset 0 -1px 0 var(--app-hairline);
    background: var(--app-glass);
    /* Lightning CSS mishandles a paired -webkit-backdrop-filter declaration. */
    backdrop-filter: blur(18px) saturate(1.4);
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
