<script setup>
import { IconDownload, IconX } from '@tabler/icons-vue'
import { useInstallPrompt } from '@/app/pwa/useInstallPrompt'

const { canInstall, install, dismiss } = useInstallPrompt()
</script>

<template>
  <div v-if="canInstall" class="card install-banner mb-4">
    <div class="card-body d-flex align-items-center gap-3">
      <span class="icon-tile flex-shrink-0"><IconDownload size="1.25rem" aria-hidden="true" /></span>

      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold">ثبّت رفيق على جهازك</div>
        <div class="small text-secondary">وصول أسرع، ويعمل بدون إنترنت</div>
      </div>

      <button type="button" class="btn btn-primary btn-sm flex-shrink-0" @click="install">تثبيت</button>

      <button type="button" class="btn btn-icon btn-flat rounded-circle flex-shrink-0" aria-label="إخفاء" @click="dismiss">
        <IconX size="1.1rem" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.install-banner .icon-tile {
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .install-banner .icon-tile {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}
</style>
