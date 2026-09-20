<script setup>
import { RouterLink } from 'vue-router'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'

import { IconDotsCircleHorizontal, IconBrandTelegram } from '@tabler/icons-vue'
import { navigation } from '@/layout/navigation'

import Logo from '@/shared/ui/Logo.vue'

const radio = useRadioStore()
const { isActive } = useActiveNav()
const primaryNavigation = navigation.filter((item) => item.menus.includes('navbar'))
const moreNavigation = navigation.filter((item) => item.menus.includes('navbar-more'))
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top py-3 app-navbar">
    <div class="container">
      <RouterLink to="/" class="navbar-brand">
        <Logo />
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="menu">
        <ul class="navbar-nav ms-lg-3 me-lg-auto mt-3 mt-lg-0 mb-2 mb-lg-0 gap-2">
          <li v-for="item in primaryNavigation" :key="item.name" class="nav-item">
            <RouterLink :to="{ name: item.name }" class="nav-link" :class="{ 'is-active': isActive(item.name) }">
              <component :is="item.icon" class="me-2" size="1.25rem" />
              <span>{{ item.label }}</span>
              <span class="radio-status ms-2" v-if="item.name === 'radio' && radio.isPlaying"></span>
            </RouterLink>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <IconDotsCircleHorizontal class="me-2" size="1.25rem" />
              <span>المزيد</span>
            </a>
            <ul class="dropdown-menu">
              <li v-for="item in moreNavigation" :key="item.name">
                <RouterLink class="dropdown-item d-flex align-items-center gap-2" :to="{ name: item.name }">
                  <component :is="item.icon" size="1.25rem" aria-hidden="true" />
                  <span>{{ item.label }}</span>
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto gap-2">
          <li class="nav-item">
            <a href="https://telegram.me/rafeeqme" target="_blank" class="nav-link nav-link--cta">
              <IconBrandTelegram class="me-2" size="1.25rem" />
              <span>قناة التليجرام</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.navbar {
  /* Allow large font scales to grow the bar. */
  min-height: var(--navbar-height);
  background: var(--app-glass);
  border-bottom: 1px solid var(--app-hairline);
  /* Lightning CSS mishandles a paired -webkit-backdrop-filter declaration. */
  backdrop-filter: blur(18px) saturate(1.4);
}

.navbar-brand {
  color: var(--bs-primary);
  transition: transform 0.25s var(--app-ease);

  &:hover {
    transform: translateY(-1px);
  }
}

.nav-item .nav-link {
  display: flex;
  align-items: center;
  padding-inline: 0.85rem;
  border-radius: 999px;
  color: var(--bs-body-color);
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: rgba(var(--bs-secondary-rgb), 0.1);
  }

  &.router-link-active,
  &.is-active {
    background-color: var(--app-tint);
    color: var(--bs-primary);
  }
}

[data-bs-theme='dark'] .nav-item .nav-link {
  &.router-link-active,
  &.is-active {
    color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
  }
}

.nav-link--cta {
  border: 1px solid var(--app-hairline-strong);
  color: var(--bs-primary) !important;

  &:hover {
    background-color: var(--app-tint) !important;
  }
}

[data-bs-theme='dark'] .nav-link--cta {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff) !important;
}

.radio-status {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--bs-danger);
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.5);
  animation: pulse-ring 1.4s infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.55);
  }

  100% {
    box-shadow: 0 0 0 0.5rem rgba(220, 53, 69, 0);
  }
}
</style>
