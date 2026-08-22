<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFetch, useOnline } from '@vueuse/core'
import { IconLocationFilled, IconDeviceMobile } from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import { Card } from '@/shared/components/ui/card'
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
    <Heading class="mb-6" title="اتجاه القبلة" subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية." />

    <!-- Desktop not supported -->
    <Card v-if="!isMobile" class="items-center gap-2 p-12 text-center">
      <IconDeviceMobile class="size-12 text-muted-foreground" />
      <p class="text-xl">هذه الميزة متاحة فقط على الهاتف</p>
      <p class="text-muted-foreground">افتح التطبيق من هاتفك لاستخدام البوصلة</p>
    </Card>

    <!-- Offline state -->
    <Card v-else-if="!online" class="p-12">
      <OfflineState />
    </Card>

    <!-- Location loading -->
    <Card v-else-if="locationLoading" class="p-12">
      <LoadingState message="جاري تحديد موقعك..." />
    </Card>

    <!-- Location error -->
    <Card
      v-else-if="locationError"
      class="cursor-pointer items-center gap-2 p-12 text-center transition-colors hover:border-primary"
      @click="requestLocation"
    >
      <IconLocationFilled class="size-12 text-destructive" />
      <p>{{ locationError }}</p>
      <p class="text-sm text-muted-foreground">إضغط للمحاولة مرة أخرى</p>
    </Card>

    <!-- Qibla API loading -->
    <Card v-else-if="isFetching" class="p-12">
      <LoadingState message="جاري تحديد اتجاه القبلة..." />
    </Card>

    <!-- Qibla API error -->
    <Card v-else-if="error" class="p-12">
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
    </Card>

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
