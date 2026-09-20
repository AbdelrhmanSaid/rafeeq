<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/layout/Navbar.vue'
import Footer from '@/layout/Footer.vue'
import TabBar from '@/layout/TabBar.vue'
import InstallBanner from '@/app/pwa/InstallBanner.vue'
import { IconWifiOff } from '@tabler/icons-vue'
import { computed, ref, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { Toaster, toast } from 'vue-sonner'
import { useThemeStore } from '@/app/stores/theme'
import { useAppStore } from '@/app/stores/app'
import { useRadioNotifications } from '@/features/radio/composables/useRadioNotifications'
import { registerSW } from 'virtual:pwa-register'

const online = useOnline()
const themeStore = useThemeStore()
const appStore = useAppStore()

useRadioNotifications()

const route = useRoute()
const isEmbedRoute = computed(() => route.path.startsWith('/embed'))

const showOfflineBanner = ref(true)

watch(online, (isOnline) => {
  if (isOnline) {
    showOfflineBanner.value = true
  }
})

// A service-worker update may reload only once per page load.
let hasReloadedForUpdate = false

const updateSW = registerSW({
  onNeedRefresh() {
    if (isEmbedRoute.value || appStore.autoUpdateServiceWorker) {
      if (hasReloadedForUpdate) return
      hasReloadedForUpdate = true
      updateSW(true)
      return
    }

    toast('يتوفر تحديث جديد للتطبيق.', {
      action: {
        label: 'تحديث الآن',
        onClick: () => updateSW(true),
      },
      duration: Infinity,
    })
  },
})
</script>

<template>
  <div :class="['app-shell', { 'main-content-embed': isEmbedRoute }]">
    <div v-if="!online && showOfflineBanner" class="offline-banner">
      <div class="container">
        <div class="d-flex align-items-center text-white">
          <IconWifiOff class="me-2" size="1.25rem" />
          <span>لا يوجد اتصال بالإنترنت</span>

          <button
            type="button"
            class="btn-close btn-close-white ms-auto"
            aria-label="Close"
            @click="showOfflineBanner = false"
          ></button>
        </div>
      </div>
    </div>

    <Navbar class="d-none d-md-block" v-if="!isEmbedRoute" />

    <div class="main-content">
      <RouterView />
    </div>

    <Footer class="d-none d-md-block" v-if="!isEmbedRoute" />

    <TabBar class="d-block d-md-none" v-if="!isEmbedRoute" />

    <InstallBanner v-if="!isEmbedRoute" />
  </div>

  <Toaster
    :theme="themeStore.mode"
    position="bottom-right"
    offset="20px"
    :mobile-offset="{ bottom: 'calc(var(--navbar-height) + env(safe-area-inset-bottom, 0px) + 12px)' }"
    :toast-options="{
      style: {
        gap: '20px',
        fontFamily: 'Thmanyah Sans, sans-serif',
      },
    }"
  />
</template>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  /* Physical safe-area sides must not be flipped by rtlcss. */
  /*! rtl:begin:ignore */
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  /*! rtl:end:ignore */
}

.offline-banner {
  min-height: 50px;
  background: linear-gradient(90deg, #c62828, #dc3545);
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 1030;
  animation: slideDown 0.3s ease-out;
}

.offline-banner + .navbar {
  top: 50px;
}

.main-content {
  flex-grow: 1;
  /* Include the tab bar's iPhone home-indicator inset. */
  padding-bottom: calc(var(--navbar-height) + env(safe-area-inset-bottom));
}

.main-content-embed .main-content {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: unset;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
