<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

import { IconDotsCircleHorizontal, IconBrandTelegram } from '@tabler/icons-vue'
import { navigation } from '@/layout/navigation'

const radio = useRadioStore()
const showMoreMenu = ref(false)

const { isActive } = useActiveNav()
const primaryNavigation = navigation.filter((item) => item.menus.includes('tabbar'))
const moreNavigation = navigation.filter((item) => item.menus.includes('tabbar-more'))
</script>

<template>
  <div>
    <BottomSheet :show="showMoreMenu" title="المزيد" @close="showMoreMenu = false">
      <div class="px-3 py-3">
        <RouterLink
          v-for="item in moreNavigation"
          :key="item.name"
          :to="{ name: item.name }"
          class="more-menu-item"
          @click="showMoreMenu = false"
        >
          <span class="icon-tile"><component :is="item.icon" size="1.25rem" aria-hidden="true" /></span>
          <span>{{ item.label }}</span>
        </RouterLink>

        <hr class="my-2 opacity-25" />

        <a href="https://t.me/rafeeqme" target="_blank" class="more-menu-item" @click="showMoreMenu = false">
          <span class="icon-tile"><IconBrandTelegram size="1.25rem" /></span>
          <span>قناة التليجرام</span>
        </a>
      </div>
    </BottomSheet>

    <nav class="position-fixed bottom-0 start-0 end-0 d-flex tab-bar" aria-label="التنقل الرئيسي">
      <div class="tab-bar__pill">
        <RouterLink
          v-for="item in primaryNavigation"
          :key="item.name"
          :to="{ name: item.name }"
          class="tab-item"
          :class="{ 'is-active': isActive(item.name) }"
        >
          <span class="tab-item__icon" :class="{ 'position-relative': item.name === 'radio' }">
            <component :is="item.icon" size="1.4rem" />
            <span class="radio-status" v-if="item.name === 'radio' && radio.isPlaying"></span>
          </span>
          <span class="tab-item__label">{{ item.label }}</span>
        </RouterLink>

        <button
          type="button"
          class="tab-item bg-transparent border-0"
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
  padding: 0.5rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom));
  /* Keep physical safe-area sides from being flipped by rtlcss. */
  /*! rtl:begin:ignore */
  padding-left: max(0.75rem, env(safe-area-inset-left, 0px));
  padding-right: max(0.75rem, env(safe-area-inset-right, 0px));
  /*! rtl:end:ignore */
  z-index: 1020;
  pointer-events: none;
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
  border-radius: var(--bs-border-radius-xl);
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
  border-radius: var(--bs-border-radius-lg);
  color: var(--bs-secondary-color);
  text-decoration: none;
  transition:
    color 0.2s ease,
    background-color 0.25s var(--app-ease),
    transform 0.25s var(--app-ease);

  &__icon {
    display: grid;
    place-items: center;
    height: 1.9rem;
  }

  &__label {
    font-size: 0.78rem;
    font-weight: 500;
    white-space: nowrap;
  }

  &:hover {
    color: var(--bs-body-color);
  }

  &.router-link-active,
  &.is-active {
    color: var(--bs-primary);
    background-color: var(--app-tint);
  }

  &:active {
    transform: scale(0.94);
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

.more-menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem 0.75rem;
  border-radius: var(--bs-border-radius-lg);
  color: var(--bs-body-color);
  font-weight: 500;
  text-decoration: none;
  transition:
    background-color 0.2s,
    color 0.2s;

  .icon-tile {
    color: var(--bs-primary);
  }

  &:hover {
    background-color: var(--app-surface-hover);
    color: var(--bs-body-color);
  }

  &.router-link-active {
    background-color: var(--app-tint);
    color: var(--bs-primary);
  }
}

[data-bs-theme='dark'] .more-menu-item {
  .icon-tile {
    color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
  }

  &.router-link-active {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}
</style>
