<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

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
} from '@tabler/icons-vue'

const radio = useRadioStore()
const showMoreMenu = ref(false)

const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()
</script>

<template>
  <div>
    <!-- More Menu -->
    <BottomSheet :show="showMoreMenu" title="المزيد" @close="showMoreMenu = false">
      <div class="px-3 py-3">
        <RouterLink :to="{ name: 'qibla' }" class="more-menu-item" @click="showMoreMenu = false">
          <span class="icon-tile"><IconCompass size="1.25rem" aria-hidden="true" /></span>
          <span>اتجاه القبلة</span>
        </RouterLink>
        <RouterLink :to="{ name: 'zakat' }" class="more-menu-item" @click="showMoreMenu = false">
          <span class="icon-tile"><IconCoins size="1.25rem" aria-hidden="true" /></span>
          <span>حاسبة الزكاة</span>
        </RouterLink>
        <RouterLink :to="{ name: 'sebha' }" class="more-menu-item" @click="showMoreMenu = false">
          <span class="icon-tile"><IconAbacus size="1.25rem" aria-hidden="true" /></span>
          <span>السبحة الإلكترونية</span>
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }" class="more-menu-item" @click="showMoreMenu = false">
          <span class="icon-tile"><IconSettings size="1.25rem" aria-hidden="true" /></span>
          <span>الإعدادات</span>
        </RouterLink>

        <hr class="my-2 opacity-25" />

        <a href="https://t.me/rafeeqme" target="_blank" class="more-menu-item" @click="showMoreMenu = false">
          <span class="icon-tile"><IconBrandTelegram size="1.25rem" /></span>
          <span>قناة التليجرام</span>
        </a>
      </div>
    </BottomSheet>

    <!-- Tab Bar -->
    <nav
      class="position-fixed bottom-0 start-0 end-0 d-flex justify-content-around py-2 tab-bar"
      aria-label="التنقل الرئيسي"
    >
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

      <button
        type="button"
        class="tab-item bg-transparent border-0"
        :aria-expanded="showMoreMenu"
        @click="showMoreMenu = !showMoreMenu"
      >
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
  /* Keep tabs clear of the notch / curved corners in landscape. Physical
     properties on purpose; the rtlcss build must not flip them. */
  /*! rtl:begin:ignore */
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  /*! rtl:end:ignore */
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
    /* ~12.5px — 11px labels were too small to read comfortably. */
    font-size: 0.78rem;
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

.more-menu-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  /* Comfortable touch rows (>=44px tall). */
  padding: 0.7rem 0.75rem;
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
</style>
