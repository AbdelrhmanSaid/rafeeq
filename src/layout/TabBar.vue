<script setup>
import { RouterLink } from 'vue-router'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'
import { useVirtualKeyboard } from '@/shared/composables/useVirtualKeyboard'
import { navigation } from '@/layout/navigation'

const radio = useRadioStore()
const { open: keyboardOpen } = useVirtualKeyboard()
const { isActive } = useActiveNav()
const tabs = navigation.filter((item) => item.menus.includes('primary'))
</script>

<template>
  <nav class="tab-bar" :class="{ 'is-hidden': keyboardOpen }" aria-label="التنقل الرئيسي">
    <div class="tab-bar__items">
      <RouterLink
        v-for="item in tabs"
        :key="item.name"
        :to="{ name: item.name }"
        class="tab-item"
        :class="{ 'is-active': isActive(item.name) }"
        :aria-current="isActive(item.name) ? 'page' : undefined"
      >
        <span class="tab-item__indicator">
          <component :is="item.icon" class="tab-item__icon" />
          <span v-if="item.name === 'radio' && radio.isPlaying" class="tab-item__live" aria-label="يعمل الآن"></span>
        </span>
        <span class="tab-item__label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 1020;
  /* Docked to the screen edge; the home indicator / gesture bar gets its own strip below the tabs. */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* Keep physical safe-area sides from being flipped by rtlcss. */
  /*! rtl:begin:ignore */
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  /*! rtl:end:ignore */
  border-top: 1px solid var(--app-hairline);
  background: var(--app-glass);
  /* Lightning CSS mishandles a paired -webkit-backdrop-filter declaration. */
  backdrop-filter: blur(20px) saturate(1.6);
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

.tab-bar__items {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  max-width: 32rem;
  /* Allow large font scales to grow the bar. */
  min-height: var(--navbar-height);
  margin-inline: auto;
  padding-inline: 0.25rem;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.5rem 0.125rem 0.375rem;
  border: 0;
  background: none;
  /* Quieter than body text in both themes, so the brand-colored current tab stands out. */
  color: color-mix(in srgb, var(--bs-body-color) 55%, transparent);
  text-decoration: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  /* Press feedback: the whole tab dims under the finger, no shapes or motion. */
  &:active {
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -4px;
    border-radius: var(--bs-border-radius);
  }
}

.tab-item__indicator {
  position: relative;
  display: grid;
  place-items: center;
  height: 1.75rem;
}

.tab-item__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.tab-item__label {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The current tab is marked by color and a firmer stroke alone, like a native tab bar. */
.tab-item.is-active {
  color: var(--bs-primary);

  .tab-item__icon {
    stroke-width: 2;
  }

  .tab-item__label {
    font-weight: 700;
  }
}

@media (hover: hover) and (pointer: fine) {
  .tab-item:hover:not(.is-active) {
    color: var(--bs-body-color);
  }
}

[data-bs-theme='dark'] .tab-item.is-active {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.tab-item__live {
  position: absolute;
  top: 0;
  inset-inline-end: -0.3rem;
  width: 0.5rem;
  height: 0.5rem;
  border: 1.5px solid var(--bs-body-bg);
  border-radius: 50%;
  background-color: var(--bs-danger);
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
</style>
