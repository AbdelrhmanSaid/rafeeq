<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/layout/Navbar.vue'
import Footer from '@/layout/Footer.vue'
import TabBar from '@/layout/TabBar.vue'
import { IconWifiOff, IconX } from '@tabler/icons-vue'
import { computed, ref, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { ConfigProvider } from 'reka-ui'
import { Toaster, toast } from 'vue-sonner'
import { Button } from '@/shared/components/ui/button'
import { useThemeStore } from '@/app/stores/theme'
import { useAppStore } from '@/app/stores/app'
import { useRadioNotifications } from '@/features/radio/composables/useRadioNotifications'
import { registerSW } from 'virtual:pwa-register'

// Network status detection
const online = useOnline()
const themeStore = useThemeStore()
const appStore = useAppStore()

useRadioNotifications()

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

// Guard against reload loops: a service worker update may only ever trigger a
// single automatic reload per page load. Without this, a churning/competing
// service worker registration can re-fire onNeedRefresh and reload the app
// on every visit a second or two after it opens.
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
  <!-- reka-ui reads the direction from here, so every menu, select and slider
       in the app is laid out RTL without setting `dir` on each of them. -->
  <ConfigProvider dir="rtl">
    <div :class="['app-shell', { 'main-content-embed': isEmbedRoute }]">
      <!-- Offline indicator -->
      <div
        v-if="!online && showOfflineBanner"
        class="offline-banner sticky top-0 z-50 flex h-12 items-center bg-destructive text-destructive-foreground animate-in fade-in slide-in-from-top duration-300"
      >
        <div class="container-page">
          <div class="flex items-center">
            <IconWifiOff class="me-2" size="1.25rem" />
            <span>لا يوجد اتصال بالإنترنت</span>

            <Button
              variant="ghost"
              size="icon-sm"
              class="ms-auto text-destructive-foreground hover:bg-destructive-foreground/15 hover:text-destructive-foreground"
              type="button"
              aria-label="Close"
              @click="showOfflineBanner = false"
            >
              <IconX size="1.125rem" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Desktop Navbar -->
      <Navbar class="hidden md:block" v-if="!isEmbedRoute" />

      <!-- Main Content -->
      <div
        class="main-content"
        :class="
          isEmbedRoute
            ? 'flex min-h-screen items-center justify-center'
            : 'min-h-[calc(100vh-var(--navbar-height))] pb-[var(--navbar-height)] lg:min-h-[calc(100vh-25rem)] lg:pb-0'
        "
      >
        <RouterView />
      </div>

      <!-- Desktop Footer -->
      <Footer class="hidden md:block" v-if="!isEmbedRoute" />

      <!-- Mobile TabBar -->
      <TabBar class="block md:hidden" v-if="!isEmbedRoute" />
    </div>

    <!-- Toast -->
    <Toaster
      :theme="themeStore.mode"
      position="bottom-left"
      offset="20px"
      :toast-options="{
        style: {
          gap: '20px',
          fontFamily: 'Thmanyah Sans, sans-serif',
        },
      }"
    />
  </ConfigProvider>
</template>

<style scoped>
/* The banner sticks to the top of the viewport, so the navbar right after it
   (also sticky) has to start below it instead of underneath. Kept as a rule
   rather than a utility because it only applies while the banner is rendered,
   and it has to reach the Navbar root element. */
.offline-banner + * {
  top: 3rem;
}
</style>
