<script setup>
import { RouterView, useRoute } from 'vue-router'
import AppBar from '@/layout/AppBar.vue'
import TopNav from '@/layout/TopNav.vue'
import TabBar from '@/layout/TabBar.vue'
import Footer from '@/layout/Footer.vue'
import InstallBanner from '@/app/pwa/InstallBanner.vue'
import { computed, onMounted, watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { Toaster, toast } from 'vue-sonner'
import { useThemeStore } from '@/app/stores/theme'
import { useAppStore } from '@/app/stores/app'
import { useRadioNotifications } from '@/features/radio/composables/useRadioNotifications'
import { registerSW } from 'virtual:pwa-register'
import { hasMushafDownloads } from '@/features/quran/lib/mushafStorage'

const themeStore = useThemeStore()
const appStore = useAppStore()

useRadioNotifications()

const route = useRoute()

const online = useOnline()

watch(online, (isOnline) => {
  if (isOnline) {
    toast.success('عاد الاتصال بالإنترنت', { id: 'network', duration: 3000 })
  } else {
    toast('لا يوجد اتصال بالإنترنت', { id: 'network', duration: 5000 })
  }
})
const isEmbedRoute = computed(() => route.path.startsWith('/embed'))
watch(isEmbedRoute, (embed) => document.body.classList.toggle('is-embed', embed), { immediate: true })

let hasReloadedForUpdate = false

// Starting the downloads store re-downloads any offline surah whose pages were evicted.
onMounted(() => {
  if (isEmbedRoute.value || !hasMushafDownloads()) return
  import('@/features/downloads/store').then(({ useDownloadStore }) => useDownloadStore()).catch(() => {})
})

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
    <TopNav class="d-none d-lg-block" v-if="!isEmbedRoute" />
    <AppBar class="d-lg-none" v-if="!isEmbedRoute && route.name !== 'home'" />

    <div class="main-content">
      <RouterView />
    </div>

    <Footer class="d-none d-lg-block" v-if="!isEmbedRoute" />

    <TabBar class="d-lg-none" v-if="!isEmbedRoute" />

    <InstallBanner v-if="!isEmbedRoute" />
  </div>

  <Toaster
    container-aria-label="الإشعارات"
    :theme="themeStore.mode"
    position="bottom-center"
    :swipe-directions="['left', 'right', 'bottom']"
    :offset="{
      bottom: 'calc(var(--navbar-height) + env(safe-area-inset-bottom, 0px) + 16px)',
      right: '20px',
      left: '20px',
    }"
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
  /*! rtl:begin:ignore */
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  /*! rtl:end:ignore */
}

.main-content {
  flex-grow: 1;
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
</style>
