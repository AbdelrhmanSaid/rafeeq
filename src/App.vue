<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Layout/Navbar.vue'
import Footer from '@/components/Layout/Footer.vue'
import TabBar from '@/components/Layout/TabBar.vue'
import { IconWifiOff } from '@tabler/icons-vue'
import { computed, ref, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { Toaster, toast } from 'vue-sonner'
import { useThemeStore } from '@/stores/theme'
import { registerSW } from 'virtual:pwa-register'

// Network status detection
const online = useOnline()
const themeStore = useThemeStore()

const route = useRoute()
const isEmbedRoute = computed(() => route.path.startsWith('/embed'))

// Offline banner visibility
const showOfflineBanner = ref(true)

// Reset banner when connection is restored
watch(online, (isOnline) => {
  if (isOnline) {
    showOfflineBanner.value = true
  }
})

const updateSW = registerSW({
  onNeedRefresh() {
    // If on embed route, update the page automatically
    if (isEmbedRoute.value) {
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
    <!-- Offline indicator -->
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

    <!-- Desktop Navbar -->
    <Navbar class="d-none d-md-block embed-hidden" />

    <!-- Main Content -->
    <div class="main-content">
      <RouterView />
    </div>

    <!-- Desktop Footer -->
    <Footer class="d-none d-md-block embed-hidden" />

    <!-- Mobile TabBar -->
    <TabBar class="d-block d-md-none embed-hidden" />
  </div>

  <!-- Toast -->
  <Toaster
    :theme="themeStore.mode"
    position="bottom-left"
    offset="20px"
    :toast-options="{
      style: {
        gap: '20px',
        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
      },
    }"
  />
</template>

<style lang="scss" scoped>
.offline-banner {
  height: 50px;
  background-color: #dc3545;
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 1030;
  animation: slideDown 0.3s ease-out;
}

.offline-banner + .navbar {
  top: 50px; /* Adjust navbar position when offline banner is visible */
}

.main-content {
  min-height: calc(100vh - var(--navbar-height)); /* Adjust for navbar and footer on desktop */
  padding-bottom: var(--navbar-height);
}

/* Embed adjustments */
.main-content-embed .main-content {
  min-height: 100vh;
  padding-bottom: unset;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Desktop adjustments */
@media (min-width: 992px) {
  .main-content {
    min-height: calc(100vh - 400px);
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
