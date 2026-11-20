<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import { useVirtualKeyboard } from '@/shared/composables/useVirtualKeyboard'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

import { IconDotsCircleHorizontal, IconBrandTelegram } from '@tabler/icons-vue'
import { navigation } from '@/layout/navigation'

const radio = useRadioStore()
const route = useRoute()
const showMoreMenu = ref(false)
const { open: keyboardOpen } = useVirtualKeyboard()

const { isActive } = useActiveNav()
const primaryNavigation = navigation.filter((item) => item.menus.includes('tabbar'))
const moreNavigation = navigation.filter((item) => item.menus.includes('tabbar-more'))

// The More tab stands for every page it lists, like a native tab bar's overflow tab.
const isMoreActive = computed(() => showMoreMenu.value || moreNavigation.some((item) => item.name === route.name))

watch(
  () => route.fullPath,
  () => (showMoreMenu.value = false),
)
</script>

<template>
  <div>
    <BottomSheet :show="showMoreMenu" title="المزيد" @close="showMoreMenu = false">
      <ul class="bottom-sheet-list">
        <li v-for="item in moreNavigation" :key="item.name">
          <RouterLink :to="{ name: item.name }" class="bottom-sheet-item more-menu-item" @click="showMoreMenu = false">
            <span class="icon-tile"><component :is="item.icon" size="1.25rem" aria-hidden="true" /></span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
        <li role="separator" class="bottom-sheet-separator"></li>
        <li>
          <a
            href="https://t.me/rafeeqme"
            target="_blank"
            rel="noopener"
            class="bottom-sheet-item more-menu-item"
            @click="showMoreMenu = false"
          >
            <span class="icon-tile"><IconBrandTelegram size="1.25rem" aria-hidden="true" /></span>
            <span>قناة التليجرام</span>
          </a>
        </li>
      </ul>
    </BottomSheet>

    <nav
      class="position-fixed bottom-0 start-0 end-0 d-flex tab-bar"
      :class="{ 'is-hidden': keyboardOpen }"
      aria-label="التنقل الرئيسي"
    >
      <div class="tab-bar__pill">
        <RouterLink
          v-for="item in primaryNavigation"
          :key="item.name"
          :to="{ name: item.name }"
          class="tab-item"
          :class="{ 'is-active': isActive(item.name) }"
          :aria-current="isActive(item.name) ? 'page' : undefined"
        >
          <span class="tab-item__icon" :class="{ 'position-relative': item.name === 'radio' }">
            <component :is="item.icon" size="1.4rem" />
            <span class="radio-status" v-if="item.name === 'radio' && radio.isPlaying"></span>
          </span>
          <span class="tab-item__label">{{ item.label }}</span>
        </RouterLink>

        <button
          type="button"
          class="tab-item"
          :class="{ 'is-active': isMoreActive }"
          aria-haspopup="dialog"
          :aria-expanded="showMoreMenu"
          @click="showMoreMenu = !showMoreMenu"
        >
          <span class="tab-item__icon"><IconDotsCircleHorizontal size="1.4rem" /></span>
          <span class="tab-item__label">المزيد</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.tab-bar {
  /* Float just above the home indicator, or a little off the edge where there is none. */
  padding: 0.5rem 0.75rem max(0.75rem, env(safe-area-inset-bottom, 0px));
  /* Keep physical safe-area sides from being flipped by rtlcss. */
  /*! rtl:begin:ignore */
  padding-left: max(0.75rem, env(safe-area-inset-left, 0px));
  padding-right: max(0.75rem, env(safe-area-inset-right, 0px));
  /*! rtl:end:ignore */
  z-index: 1020;
  pointer-events: none;
  transition:
    transform 0.3s var(--app-ease-out),
    opacity 0.2s ease;

  /* Out of the way while the keyboard is up, instead of riding over the field being typed in. */
  &.is-hidden {
    transform: translateY(100%);
    opacity: 0;
    visibility: hidden;
    transition:
      transform 0.2s ease-in,
      opacity 0.2s ease-in,
      visibility 0s 0.2s;
  }
}

.tab-bar__pill {
  pointer-events: auto;
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
  flex: 1;
  max-width: 28rem;
  margin-inline: auto;
  /* Allow large font scales to grow the pill. */
  min-height: calc(var(--navbar-height) - 1rem);
  padding: 0.3rem;
  border: 1px solid var(--app-hairline);
  border-radius: calc(var(--bs-border-radius-xl) + 0.3rem);
  background: var(--app-glass);
  box-shadow: var(--app-shadow-card-hover);
  /* Lightning CSS mishandles a paired -webkit-backdrop-filter declaration. */
  backdrop-filter: blur(18px) saturate(1.4);
}

.tab-item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.25rem;
  border: 0;
  border-radius: var(--bs-border-radius-xl);
  background: none;
  color: var(--bs-secondary-color);
  text-decoration: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  transition:
    color 0.2s ease,
    background-color 0.25s var(--app-ease);

  &__icon {
    display: grid;
    place-items: center;
    height: 1.9rem;
    transition: transform 0.15s var(--app-ease-out);
  }

  &__label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  /* Press the icon, not the whole capsule, so the active tint does not wobble. */
  &:active .tab-item__icon {
    transform: scale(0.88);
  }

  &.router-link-active,
  &.is-active {
    color: var(--bs-primary);
    background-color: var(--app-tint);

    .tab-item__label {
      font-weight: 600;
    }
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .tab-item:hover {
    color: var(--bs-body-color);
  }
}

[data-bs-theme='dark'] .tab-item {
  color: var(--bs-body-color);

  &.router-link-active,
  &.is-active {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}

.radio-status {
  position: absolute;
  top: -0.1rem;
  inset-inline-end: -0.25rem;
  width: 0.45rem;
  height: 0.45rem;
  background-color: var(--bs-danger);
  border-radius: 50%;
  animation: pulse-ring 1.4s infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.55);
  }

  100% {
    box-shadow: 0 0 0 0.4rem rgba(220, 53, 69, 0);
  }
}

.more-menu-item .icon-tile {
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .more-menu-item .icon-tile {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}
</style>
