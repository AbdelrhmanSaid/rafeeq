<script setup>
import { Toaster } from 'vue-sonner'

const modeStore = useModeStore()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Toast -->
  <Toaster
    v-if="isMounted"
    :theme="modeStore.mode"
    position="bottom-left"
    offset="20px"
    dir="rtl"
    :toast-options="{
      style: {
        gap: '20px',
        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
      },
    }"
  />
</template>

