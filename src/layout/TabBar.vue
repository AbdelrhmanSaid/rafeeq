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
    <nav class="position-fixed bottom-0 start-0 end-0 d-flex tab-bar" aria-label="التنقل الرئيسي">
      <div class="tab-bar__pill">
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

        <RouterLink :to="{ name: 'radio' }" class="tab-item" :class="{ 'is-active': isRadioActive }">
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
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
/* Floating pill bar — the fixed strip is an invisible, click-through gutter;
   the pill inside carries the surface, inset from the screen edges. Its total
   footprint stays exactly `--navbar-height` + the safe-area inset, so the
   main-content bottom padding and every offset derived from it keep holding. */
.tab-bar {
  padding: 0.5rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom));
  /* Keep tabs clear of the notch / curved corners in landscape. Physical
     properties on purpose; the rtlcss build must not flip them. */
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
  /* min-height (bar height minus the strip's vertical padding) so labels and
     icons at large font scales grow the pill, not clip. */
  min-height: calc(var(--navbar-height) - 1rem);
  padding: 0.3rem;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-xl);
  background: var(--app-glass);
  box-shadow: var(--app-shadow-card-hover);
  /* No -webkit- duplicate here: Lightning CSS merges the pair and emits only
     the prefixed property, which Chrome/Firefox ignore (no blur in prod
     builds). The prefix is auto-generated at build time from cssTarget. */
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
    /* ~12.5px — 11px labels were too small to read comfortably. */
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
  /* Comfortable touch rows (>=44px tall). */
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
