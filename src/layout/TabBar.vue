<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'

import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconDotsCircleHorizontal,
  IconBrandTelegram,
  IconCompass,
  IconCoins,
  IconAbacus,
  IconSettings,
  IconX,
} from '@tabler/icons-vue'

const radio = useRadioStore()
const showMoreMenu = ref(false)
const isClosing = ref(false)

const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()

const toggleMoreMenu = () => {
  if (showMoreMenu.value) {
    closeMoreMenu()
  } else {
    showMoreMenu.value = true
    isClosing.value = false
  }
}

const closeMoreMenu = () => {
  isClosing.value = true
  setTimeout(() => {
    showMoreMenu.value = false
    isClosing.value = false
  }, 300) // Match animation duration
}
</script>

<template>
  <div>
    <!-- More Menu Overlay -->
    <div
      v-if="showMoreMenu"
      class="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-end more-menu-overlay"
      :class="{ closing: isClosing }"
      @click="closeMoreMenu"
    >
      <div class="bg-body w-100 more-menu" :class="{ closing: isClosing }" @click.stop style="max-height: 70vh">
        <span class="more-menu__grip" aria-hidden="true"></span>
        <div class="d-flex justify-content-between align-items-center px-4 pt-2 pb-3">
          <h5 class="mb-0">المزيد</h5>
          <button class="btn btn-icon btn-flat rounded-circle" @click="closeMoreMenu" aria-label="إغلاق">
            <IconX size="1.25rem" />
          </button>
        </div>

        <div class="px-3 pb-3">
          <RouterLink :to="{ name: 'qibla' }" class="more-menu-item" @click="closeMoreMenu">
            <span class="icon-tile"><IconCompass size="1.25rem" aria-hidden="true" /></span>
            <span>اتجاه القبلة</span>
          </RouterLink>
          <RouterLink :to="{ name: 'zakat' }" class="more-menu-item" @click="closeMoreMenu">
            <span class="icon-tile"><IconCoins size="1.25rem" aria-hidden="true" /></span>
            <span>حاسبة الزكاة</span>
          </RouterLink>
          <RouterLink :to="{ name: 'sebha' }" class="more-menu-item" @click="closeMoreMenu">
            <span class="icon-tile"><IconAbacus size="1.25rem" aria-hidden="true" /></span>
            <span>السبحة الإلكترونية</span>
          </RouterLink>
          <RouterLink :to="{ name: 'settings' }" class="more-menu-item" @click="closeMoreMenu">
            <span class="icon-tile"><IconSettings size="1.25rem" aria-hidden="true" /></span>
            <span>الإعدادات</span>
          </RouterLink>

          <hr class="my-2 opacity-25" />

          <a href="https://t.me/rafeeqme" target="_blank" class="more-menu-item" @click="closeMoreMenu">
            <span class="icon-tile"><IconBrandTelegram size="1.25rem" /></span>
            <span>قناة التليجرام</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Tab Bar -->
    <nav class="position-fixed bottom-0 start-0 end-0 d-flex justify-content-around py-2 tab-bar">
      <RouterLink :to="{ name: 'home' }" class="tab-item">
        <span class="tab-item__icon"><IconHome size="1.4rem" /></span>
        <span class="tab-item__label">الرئيسية</span>
      </RouterLink>

      <RouterLink :to="{ name: 'quran' }" class="tab-item" :class="{ 'is-active': isQuranActive }">
        <span class="tab-item__icon"><IconBook size="1.4rem" /></span>
        <span class="tab-item__label">القرآن</span>
      </RouterLink>

      <RouterLink :to="{ name: 'azkar' }" class="tab-item" :class="{ 'is-active': isAzkarActive }">
        <span class="tab-item__icon"><IconSparkles size="1.4rem" /></span>
        <span class="tab-item__label">الأذكار</span>
      </RouterLink>

      <RouterLink :to="{ name: 'radio' }" class="tab-item position-relative" :class="{ 'is-active': isRadioActive }">
        <span class="tab-item__icon position-relative">
          <IconRadio size="1.4rem" />
          <span class="radio-status" v-if="radio.isPlaying"></span>
        </span>
        <span class="tab-item__label">الإذاعة</span>
      </RouterLink>

      <button class="tab-item bg-transparent border-0" @click="toggleMoreMenu">
        <span class="tab-item__icon"><IconDotsCircleHorizontal size="1.4rem" /></span>
        <span class="tab-item__label">المزيد</span>
      </button>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.tab-bar {
  /* min-height so labels/icons at large font scales grow the bar, not clip. */
  min-height: var(--navbar-height);
  align-items: center;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  z-index: 1020;
  background: var(--app-glass);
  border-top: 1px solid var(--app-hairline);
  box-shadow: var(--app-shadow-bar);
  /* No -webkit- duplicate here: Lightning CSS merges the pair and emits only
     the prefixed property, which Chrome/Firefox ignore (no blur in prod
     builds). The prefix is auto-generated at build time from cssTarget. */
  backdrop-filter: blur(18px) saturate(1.4);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 60px;
  padding: 0.2rem 0.4rem;
  color: var(--bs-secondary-color);
  text-decoration: none;
  transition: color 0.2s ease;

  &__icon {
    display: grid;
    place-items: center;
    width: 3.25rem;
    height: 1.9rem;
    border-radius: 999px;
    transition:
      background-color 0.25s var(--app-ease),
      transform 0.25s var(--app-ease);
  }

  &__label {
    font-size: 0.7rem;
    font-weight: 500;
  }

  &:hover {
    color: var(--bs-body-color);
  }

  &.router-link-active,
  &.is-active {
    color: var(--bs-primary);

    .tab-item__icon {
      background-color: var(--app-tint);
    }
  }

  &:active .tab-item__icon {
    transform: scale(0.92);
  }
}

/* Secondary-color is too dim on the dark glass bar; use the light body color
   (same as the more/settings menu items) and keep the active tint on top. */
[data-bs-theme='dark'] .tab-item {
  color: var(--bs-body-color);

  &.router-link-active,
  &.is-active {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}

.radio-status {
  position: absolute;
  top: 0.15rem;
  inset-inline-end: 0.55rem;
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

.more-menu-overlay {
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1030;
  backdrop-filter: blur(4px);
  opacity: 1;
  transition: opacity 0.3s ease-out;

  &.closing {
    opacity: 0;
  }
}

.more-menu {
  border-radius: var(--bs-border-radius-xl) var(--bs-border-radius-xl) 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.35s var(--app-ease);
  /* Keep the panel on its own compositing layer for the whole lifetime so the
     text isn't re-rasterized (and nudged sub-pixel) when the slide ends. */
  will-change: transform;
  backface-visibility: hidden;

  &.closing {
    animation: none;
    transform: translateY(100%);
    opacity: 0;
    transition:
      transform 0.3s ease-out,
      opacity 0.3s ease-out;
  }

  &__grip {
    display: block;
    width: 2.5rem;
    height: 0.3rem;
    margin: 0.6rem auto 0.4rem;
    border-radius: 999px;
    background: rgba(var(--bs-secondary-rgb), 0.3);
  }
}

.more-menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--bs-border-radius);
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

/* Primary stays a dark accent (brown/green/navy); mix it toward white so
   menu icons and the active row remain readable on the dark sheet. */
[data-bs-theme='dark'] .more-menu-item {
  .icon-tile {
    color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
  }

  &.router-link-active {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}

@keyframes slideUp {
  from {
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}
</style>
