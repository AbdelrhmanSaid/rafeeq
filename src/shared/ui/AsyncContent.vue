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
  retry: { type: Function, default: null },
})

const online = useOnline()
</script>

<template>
  <Page v-if="pending" class="full-height async-state">
    <LoadingState :message="loadingMessage" />
  </Page>

  <Page v-else-if="error" class="full-height async-state">
    <OfflineState v-if="!online" :retry="retry" />
    <ErrorState v-else message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة مرة أخرى." :retry="retry" />
  </Page>

  <slot v-else />
</template>

<style scoped>
.async-state {
  display: grid;
  place-items: center;
}
</style>
