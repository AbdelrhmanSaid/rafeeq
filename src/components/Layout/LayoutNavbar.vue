<script setup>
import { RouterLink } from 'vue-router'
import { useModeStore } from '@/stores/mode'
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
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light border-bottom py-3">
    <div class="container">
      <RouterLink to="/" class="navbar-brand">
        <img :src="logo" alt="رفيق" height="42" class="navbar-brand-img" />
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="menu">
        <ul class="navbar-nav ms-lg-3 me-lg-auto mt-3 mt-lg-0 gap-2">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link">
              <IconHome class="me-2" size="1.25rem" />
              <span>الرئيسية</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/quran" class="nav-link">
              <IconBook class="me-2" size="1.25rem" />
              <span>القرآن الكريم</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/hadith" class="nav-link">
              <IconBook2 class="me-2" size="1.25rem" />
              <span>السنة النبوية</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/adhkar" class="nav-link">
              <IconSparkles class="me-2" size="1.25rem" />
              <span>الأذكار</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/radio" class="nav-link">
              <IconRadio class="me-2" size="1.25rem" />
              <span>الإذاعة</span>
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
            <RouterLink to="/settings" class="nav-link">
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
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover,
  &.router-link-active {
    background-color: rgba(var(--bs-primary-rgb), 0.1);
  }
}
</style>
