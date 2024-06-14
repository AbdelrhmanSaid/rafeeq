<script setup>
import { RouterLink } from 'vue-router'
import { useModeStore } from '@/stores/mode'
import { useRadioStore } from '@/stores/radio'
import {
  IconMoonStars,
  IconSunFilled,
  IconHome,
  IconBook,
  IconBook2,
  IconSparkles,
  IconRadio,
  IconSettings,
} from '@tabler/icons-vue'

import logo from '@/assets/images/logo.svg'

const mode = useModeStore()
const radio = useRadioStore()
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top navbar-light bg-body border-bottom py-3">
    <div class="container">
      <RouterLink to="/" class="navbar-brand">
        <img :src="logo" alt="رفيق" height="42" class="navbar-brand-img" />
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="menu">
        <ul class="navbar-nav ms-lg-3 me-lg-auto mt-3 mt-lg-0 mb-2 mb-lg-0 gap-2">
          <li class="nav-item">
            <RouterLink :to="{ name: 'home' }" class="nav-link">
              <IconHome class="me-2" size="1.25rem" />
              <span>الرئيسية</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink :to="{ name: 'quran' }" class="nav-link">
              <IconBook class="me-2" size="1.25rem" />
              <span>القرآن الكريم</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink :to="{ name: 'hadith' }" class="nav-link">
              <IconBook2 class="me-2" size="1.25rem" />
              <span>السنة النبوية</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink :to="{ name: 'hisn-al-muslim' }" class="nav-link">
              <IconSparkles class="me-2" size="1.25rem" />
              <span>حصن المسلم</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink :to="{ name: 'radio' }" class="nav-link">
              <IconRadio class="me-2" size="1.25rem" />
              <span>الإذاعة</span>
              <span class="radio-status ms-2" v-if="radio.isPlaying"></span>
            </RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto gap-2">
          <li class="nav-item">
            <a href="#" class="nav-link" @click.prevent="mode.toggle()">
              <span v-if="mode.isDark">
                <IconSunFilled class="me-2" size="1.25rem" />
                <span>الوضع الفاتح</span>
              </span>

              <span v-else>
                <IconMoonStars class="me-2" size="1.25rem" />
                <span>الوضع الداكن</span>
              </span>
            </a>
          </li>

          <li class="nav-item">
            <RouterLink :to="{ name: 'settings' }" class="nav-link">
              <IconSettings class="me-2" size="1.25rem" />
              <span>الإعدادات</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
[data-bs-theme='dark'] {
  .navbar-brand img {
    filter: brightness(0) invert(1);
  }
}

.nav-item .nav-link {
  display: flex;
  align-items: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover,
  &.router-link-active {
    background-color: rgba(var(--bs-primary-rgb), 0.1);
  }
}

.radio-status {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--bs-danger);
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(0.9);
  }
}
</style>
