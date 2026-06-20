<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { IconLocationFilled, IconDeviceMobile } from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'
import QiblaCompass from '@/features/qibla/components/QiblaCompass.vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useDeviceCompass } from '@/features/qibla/composables/useDeviceCompass'
import { API } from '@/shared/constants/api'

const online = useOnline()
const isMobile = useIsMobile()

// Location state (fresh from navigator, not stored)
const latitude = ref(null)
const longitude = ref(null)
const locationLoading = ref(true)
const locationError = ref(null)

async function requestLocation() {
  locationLoading.value = true
  locationError.value = null

  try {
    const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
    latitude.value = position.coords.latitude
    longitude.value = position.coords.longitude
  } catch (err) {
    if (!navigator.geolocation) locationError.value = 'الموقع الجغرافي غير مدعوم في هذا المتصفح'
    else if (err?.code === 1) locationError.value = 'تم رفض إذن الوصول للموقع'
    else if (err?.code === 2) locationError.value = 'الموقع غير متاح حالياً'
    else locationError.value = 'فشل في تحديد الموقع'
  } finally {
    locationLoading.value = false
  }
}

const endpoint = computed(() => {
  if (!latitude.value || !longitude.value) return null
  return `${API.aladhan}/qibla/${latitude.value}/${longitude.value}`
})

const fetchOptions = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (!url) cancel()
  },
}

const { isFetching, data: qiblaData, error } = useFetch(endpoint, fetchOptions).json().get()

const qiblaDirection = computed(() => {
  const direction = qiblaData.value?.data?.direction
  return typeof direction === 'number' ? direction : null
})

const { heading, hasSupport, error: compassError, canRequestPermission, requestPermission } = useDeviceCompass()

onMounted(requestLocation)
</script>

<template>
  <Page>
    <Heading class="mb-4" title="اتجاه القبلة" subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية." />

    <!-- Desktop not supported -->
    <div v-if="!isMobile" class="qibla-card qibla-card--static text-center">
      <IconDeviceMobile size="3rem" class="text-muted mb-3" />
      <p class="h5 mb-2">هذه الميزة متاحة فقط على الهاتف</p>
      <p class="text-muted mb-0">افتح التطبيق من هاتفك لاستخدام البوصلة</p>
    </div>

    <!-- Offline state -->
    <div v-else-if="!online" class="qibla-card qibla-card--static">
      <OfflineState />
    </div>

    <!-- Location loading -->
    <div v-else-if="locationLoading" class="qibla-card qibla-card--static">
      <LoadingState message="جاري تحديد موقعك..." />
    </div>

    <!-- Location error -->
    <div v-else-if="locationError" class="qibla-card qibla-card--clickable text-center" @click="requestLocation">
      <IconLocationFilled size="3rem" class="text-danger mb-3" />
      <p class="mb-2">{{ locationError }}</p>
      <p class="text-muted small mb-0">إضغط للمحاولة مرة أخرى</p>
    </div>

    <!-- Qibla API loading -->
    <div v-else-if="isFetching" class="qibla-card qibla-card--static">
      <LoadingState message="جاري تحديد اتجاه القبلة..." />
    </div>

    <!-- Qibla API error -->
    <div v-else-if="error" class="qibla-card qibla-card--static">
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
    </div>

    <!-- Qibla compass -->
    <QiblaCompass
      v-else-if="qiblaDirection !== null"
      :qibla-direction="qiblaDirection"
      :heading="heading"
      :has-compass-support="hasSupport"
      :compass-error="compassError"
      :can-request-permission="canRequestPermission"
      @request-permission="requestPermission"
    />
  </Page>
</template>

<style lang="scss" scoped>
.qibla-card {
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 3rem;
  transition: border-color 0.2s;

  &--clickable {
    cursor: pointer;

    &:hover {
      border-color: var(--bs-primary);
    }
  }

  &--static {
    cursor: default;
  }
}
</style>
