<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Layout/Navbar.vue'
import Footer from '@/components/Layout/Footer.vue'
import TabBar from '@/components/Layout/TabBar.vue'
import { IconWifiOff } from '@tabler/icons-vue'
import { useOnline } from '@vueuse/core'

// Network status detection
const online = useOnline()
</script>

<template>
  <!-- Offline indicator -->
  <div v-if="!online" class="offline-banner">
    <div class="container">
      <div class="d-flex align-items-center justify-content-center text-white">
        <IconWifiOff class="me-2" size="1.25rem" />
        <span>لا يوجد اتصال بالإنترنت</span>
      </div>
    </div>
  </div>

  <!-- Desktop Navbar -->
  <Navbar class="d-none d-md-block" />

  <!-- Main Content -->
  <div class="main-content">
    <RouterView />
  </div>

  <!-- Desktop Footer -->
  <Footer class="d-none d-md-block mt-5" />

  <!-- Mobile TabBar -->
  <TabBar class="d-block d-md-none" />
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
  min-height: calc(100vh - 120px); /* Adjust for navbar and footer on desktop */
  padding-bottom: 80px; /* Add padding for mobile tab bar */
}

/* Desktop adjustments */
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
