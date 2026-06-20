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
  errorMessage: { type: String, default: 'حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق.' },
})

const online = useOnline()
</script>

<template>
  <Page v-if="pending">
    <LoadingState :message="loadingMessage" />
  </Page>

  <Page v-else-if="error">
    <OfflineState v-if="!online" />
    <ErrorState v-else :code="500" :message="errorMessage" />
  </Page>

  <slot v-else />
</template>
