<script setup>
import { RouterLink } from 'vue-router'
import { useModeStore } from '@/stores/mode'
import { IconMoonStars, IconSunFilled } from '@tabler/icons-vue'
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
        <ul class="navbar-nav ms-lg-3 me-lg-auto mt-2 mt-lg-0">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link">الرئيسية</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/" class="nav-link">رابط 1</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/" class="nav-link">رابط 2</RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
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
            <RouterLink to="/" class="nav-link">رابط 2</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
[data-bs-theme='dark'] .navbar-brand img {
  filter: brightness(0) invert(1);
}
</style>
