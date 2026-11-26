<script setup>
import { RouterLink } from 'vue-router'
import { IconChevronRight, IconShare3 } from '@tabler/icons-vue'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import { navigation } from '@/layout/navigation'
import { pageHeader } from '@/layout/pageHeader'
import { useBackNavigation } from '@/layout/useBackNavigation'
import { sharePage } from '@/shared/utils/share'
import Logo from '@/shared/ui/Logo.vue'

const radio = useRadioStore()
const { isActive } = useActiveNav()
const { parent, goBack } = useBackNavigation()
const destinations = navigation.filter((item) => item.menus.includes('primary'))
</script>

<template>
  <!-- Desktop counterpart of the app bar and tab bar together: back, brand, destinations and the page's share. -->
  <header class="top-nav">
    <div class="top-nav__inner container">
      <!-- Always in the layout, only shown on detail screens, so the logo and tabs never shift between pages. -->
      <button
        type="button"
        class="top-nav__action top-nav__back"
        :class="{ 'is-hidden': !parent }"
        :disabled="!parent"
        :aria-hidden="!parent"
        aria-label="رجوع"
        @click="goBack"
      >
        <IconChevronRight size="1.5rem" aria-hidden="true" />
      </button>

      <RouterLink to="/" class="top-nav__brand" aria-label="رفيق">
        <Logo :size="28" />
      </RouterLink>

      <nav class="top-nav__items" aria-label="التنقل الرئيسي">
        <RouterLink
          v-for="item in destinations"
          :key="item.name"
          :to="{ name: item.name }"
          class="top-nav-item"
          :class="{ 'is-active': isActive(item.name) }"
          :aria-current="isActive(item.name) ? 'page' : undefined"
        >
          <span class="top-nav-item__icon">
            <component :is="item.icon" />
            <span
              v-if="item.name === 'radio' && radio.isPlaying"
              class="top-nav-item__live"
              aria-label="يعمل الآن"
            ></span>
          </span>
          <span class="top-nav-item__label" :data-label="item.label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <button
        v-if="pageHeader.share"
        type="button"
        class="top-nav__action top-nav__action--end"
        aria-label="مشاركة الصفحة"
        @click="sharePage(pageHeader.title)"
      >
        <IconShare3 size="1.25rem" aria-hidden="true" />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 1020;
  padding-top: env(safe-area-inset-top, 0px);
  border-bottom: 1px solid var(--app-hairline);
  background: var(--app-glass);
  /* Lightning CSS mishandles a paired -webkit-backdrop-filter declaration. */
  backdrop-filter: blur(20px) saturate(1.6);
}

.top-nav__inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  height: var(--topnav-height);
}

.top-nav__action {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--bs-body-color);
  transition: background-color 0.15s ease;

  &--end {
    margin-inline: auto 0;
  }

  &.is-hidden {
    visibility: hidden;
  }

  &:active {
    background-color: var(--app-tint);
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .top-nav__action:hover {
    background-color: var(--app-surface-hover);
  }
}

.top-nav__back {
  /* Sits close to the logo, as one unit with it. */
  margin-inline-end: -1.25rem;
}

.top-nav__brand {
  display: flex;
  flex-shrink: 0;
}

.top-nav__items {
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
  height: 100%;
}

.top-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-inline: 0.875rem;
  color: color-mix(in srgb, var(--bs-body-color) 55%, transparent);
  font-weight: 500;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -0.75rem;
    border-radius: var(--bs-border-radius);
  }

  /* A hairline under the current destination, sitting on the bar's bottom edge. */
  &.is-active {
    color: var(--bs-primary);
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      inset-inline: 0.875rem;
      bottom: -1px;
      height: 2px;
      border-radius: 2px 2px 0 0;
      background: currentColor;
    }

    .top-nav-item__icon svg {
      stroke-width: 2;
    }
  }
}

@media (hover: hover) and (pointer: fine) {
  .top-nav-item:hover:not(.is-active) {
    color: var(--bs-body-color);
  }
}

[data-bs-theme='dark'] .top-nav-item.is-active {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

/* Reserve the bold width up front, so turning bold on the current tab never nudges its neighbours. */
.top-nav-item__label {
  display: inline-flex;
  flex-direction: column;

  &::after {
    content: attr(data-label);
    height: 0;
    overflow: hidden;
    font-weight: 700;
    visibility: hidden;
    user-select: none;
    pointer-events: none;
  }
}

.top-nav-item__icon {
  position: relative;
  display: grid;
  place-items: center;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.top-nav-item__live {
  position: absolute;
  top: -0.1rem;
  inset-inline-end: -0.25rem;
  width: 0.45rem;
  height: 0.45rem;
  border: 1.5px solid var(--bs-body-bg);
  border-radius: 50%;
  background-color: var(--bs-danger);
}
</style>
