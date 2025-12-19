<script setup>
import { IconWifiOff } from '@tabler/icons-vue'
import { useOnline } from '@vueuse/core'
import { ref, watch } from 'vue'

// Network status detection
const online = useOnline()

// Offline banner visibility
const showOfflineBanner = ref(true)

// Reset banner when connection is restored
watch(online, (isOnline) => {
  if (isOnline) {
    showOfflineBanner.value = true
  }
})
</script>

<template>
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
  <LayoutNavbar class="d-none d-md-block" />

  <!-- Main Content -->
  <div class="main-content">
    <slot />
  </div>

  <!-- Desktop Footer -->
  <LayoutFooter class="d-none d-md-block mt-5" />

  <!-- Mobile TabBar -->
  <LayoutTabBar class="d-block d-md-none" />
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
  top: 50px;
}

.main-content {
  min-height: calc(100vh - 120px);
  padding-bottom: 80px;
}

@media (min-width: 992px) {
  .main-content {
    min-height: calc(100vh - 200px);
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

