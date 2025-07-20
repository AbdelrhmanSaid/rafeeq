<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '@/components/Layout/Navbar.vue'
import Footer from '@/components/Layout/Footer.vue'
import { IconWifiOff } from '@tabler/icons-vue'

// Network status detection
const isOnline = ref(navigator.onLine)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<template>
  <!-- Offline indicator -->
  <div v-if="!isOnline" class="offline-banner">
    <div class="container">
      <div class="d-flex align-items-center justify-content-center text-white">
        <IconWifiOff class="me-2" size="1.25rem" />
        <span>لا يوجد اتصال بالإنترنت</span>
      </div>
    </div>
  </div>

  <Navbar />
  <RouterView />
  <Footer />
</template>

<style lang="scss" scoped>
.offline-banner {
  background-color: #dc3545;
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 1030;
  animation: slideDown 0.3s ease-out;
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
