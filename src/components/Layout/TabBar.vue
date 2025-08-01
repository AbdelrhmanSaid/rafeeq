<script setup>
import { RouterLink } from 'vue-router'
import { useModeStore } from '@/stores/mode'
import { useRadioStore } from '@/stores/radio'
import { ref } from 'vue'

import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconDotsCircleHorizontal,
  IconMoonStars,
  IconSunFilled,
  IconBrandTelegram,
  IconX,
} from '@tabler/icons-vue'

const mode = useModeStore()
const radio = useRadioStore()
const showMoreMenu = ref(false)
const isClosing = ref(false)

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

const toggleMode = () => {
  mode.toggle()
  closeMoreMenu()
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
      <div
        class="bg-body rounded-top-3 w-100 more-menu"
        :class="{ closing: isClosing }"
        @click.stop
        style="max-height: 70vh"
      >
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h5 class="mb-0">المزيد</h5>
          <button class="btn btn-sm" @click="closeMoreMenu">
            <IconX size="1.25rem" />
          </button>
        </div>

        <div class="py-3">
          <RouterLink
            :to="{ name: 'zakat' }"
            class="d-flex align-items-center px-4 py-2 text-decoration-none text-body more-menu-item"
            @click="closeMoreMenu"
          >
            حاسبة الزكاة
          </RouterLink>
          <RouterLink
            :to="{ name: 'sebha' }"
            class="d-flex align-items-center px-4 py-2 text-decoration-none text-body more-menu-item"
            @click="closeMoreMenu"
          >
            السبحة الإلكترونية
          </RouterLink>
          <RouterLink
            :to="{ name: 'settings' }"
            class="d-flex align-items-center px-4 py-2 text-decoration-none text-body more-menu-item"
            @click="closeMoreMenu"
          >
            الإعدادات
          </RouterLink>

          <hr class="my-3" />

          <a
            href="#"
            class="d-flex align-items-center px-4 py-2 text-decoration-none text-body more-menu-item"
            @click.prevent="toggleMode"
          >
            <span v-if="mode.isDark" class="d-flex align-items-center">
              <IconSunFilled class="me-2" size="1.25rem" />
              الوضع الفاتح
            </span>
            <span v-else class="d-flex align-items-center">
              <IconMoonStars class="me-2" size="1.25rem" />
              الوضع الداكن
            </span>
          </a>

          <a
            href="https://t.me/rafeeqme"
            target="_blank"
            class="d-flex align-items-center px-4 py-2 text-decoration-none text-body more-menu-item"
            @click="closeMoreMenu"
          >
            <IconBrandTelegram class="me-2" size="1.25rem" />
            قناة التليجرام
          </a>
        </div>
      </div>
    </div>

    <!-- Tab Bar -->
    <nav class="position-fixed bottom-0 start-0 end-0 bg-body border-top d-flex justify-content-around py-2 tab-bar">
      <RouterLink
        :to="{ name: 'home' }"
        class="d-flex flex-column align-items-center text-decoration-none text-secondary px-2 py-1 rounded tab-item"
      >
        <IconHome size="1.5rem" />
        <span class="mt-1 small">الرئيسية</span>
      </RouterLink>

      <RouterLink
        :to="{ name: 'quran' }"
        class="d-flex flex-column align-items-center text-decoration-none text-secondary px-2 py-1 rounded tab-item"
      >
        <IconBook size="1.5rem" />
        <span class="mt-1 small">القرآن</span>
      </RouterLink>

      <RouterLink
        :to="{ name: 'azkar' }"
        class="d-flex flex-column align-items-center text-decoration-none text-secondary px-2 py-1 rounded tab-item"
      >
        <IconSparkles size="1.5rem" />
        <span class="mt-1 small">الأذكار</span>
      </RouterLink>

      <RouterLink
        :to="{ name: 'radio' }"
        class="d-flex flex-column align-items-center text-decoration-none text-secondary px-2 py-1 rounded position-relative tab-item"
      >
        <IconRadio size="1.5rem" />
        <span class="mt-1 small">الإذاعة</span>
        <span class="position-absolute top-0 end-0 radio-status" v-if="radio.isPlaying"></span>
      </RouterLink>

      <button
        class="d-flex flex-column align-items-center text-secondary bg-transparent border-0 px-2 py-1 rounded tab-item"
        @click="toggleMoreMenu"
      >
        <IconDotsCircleHorizontal size="1.5rem" />
        <span class="mt-1 small">المزيد</span>
      </button>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.tab-bar {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  z-index: 1020;
}

.tab-item {
  transition: color 0.2s;
  min-width: 60px;
  font-size: 0.75rem;

  span:not(.radio-status) {
    font-size: 0.7rem;
  }

  &:hover,
  &.router-link-active {
    color: var(--bs-primary) !important;
  }

  &.router-link-active {
    background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
  }
}

.radio-status {
  width: 0.4rem;
  height: 0.4rem;
  background-color: var(--bs-danger);
  border-radius: 50%;
  animation: pulse 1s infinite;
  transform: translate(25%, -25%);
}

@keyframes pulse {
  0% {
    transform: translate(25%, -25%) scale(0.9);
  }
  50% {
    transform: translate(25%, -25%) scale(1.1);
  }
  100% {
    transform: translate(25%, -25%) scale(0.9);
  }
}

.more-menu-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1030;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  opacity: 1;
  transition: opacity 0.3s ease-out;

  &.closing {
    opacity: 0;
  }
}

.more-menu {
  animation: slideUp 0.3s ease-out;

  &.closing {
    animation: none;
    transform: translateY(100%);
    opacity: 0;
    transition:
      transform 0.3s ease-out,
      opacity 0.3s ease-out;
  }
}

.more-menu-item {
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bs-secondary-bg) !important;
    color: var(--bs-body-color) !important;
  }

  &.router-link-active {
    background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
    color: var(--bs-primary) !important;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
