<script setup>
import { useOnline } from '@vueuse/core'
import Page from '@/layout/Page.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'

defineProps({
  pending: { type: Boolean, default: false },
  error: { type: [Object, Error], default: null },
  loadingMessage: { type: String, default: undefined },
  errorMessage: { type: String, default: 'حدث خطأ أثناء تحميل البيانات، برجاء المحاولة مرة أخرى.' },
  // Reloads the content; offered as a "try again" button on the error and offline states.
  retry: { type: Function, default: null },
})

const online = useOnline()
</script>

<template>
  <!-- Loading and failure fill the screen and sit in its centre. -->
  <Page v-if="pending" class="full-height async-state">
    <LoadingState :message="loadingMessage" />
  </Page>

  <Page v-else-if="error" class="full-height async-state">
    <OfflineState v-if="!online" :retry="retry" />
    <ErrorState v-else :message="errorMessage" :retry="retry" />
  </Page>

  <slot v-else />
</template>

<style scoped>
.async-state {
  display: grid;
  place-items: center;
}
</style>
