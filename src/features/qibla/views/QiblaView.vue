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

const stateCardClass = 'rounded-2xl bg-card text-card-foreground shadow-sm'

onMounted(requestLocation)
</script>
<template>
  <Page class="space-y-6">
    <Heading title="اتجاه القبلة" subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية." />
    <!-- Desktop not supported -->
    <div v-if="!isMobile" :class="stateCardClass">
      <div class="flex flex-col items-center gap-4 px-4 py-10 text-center">
        <span class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <IconDeviceMobile class="size-6" />
        </span>
        <div class="space-y-1">
          <p class="text-lg">هذه الميزة متاحة فقط على الهاتف</p>
          <p class="text-sm leading-relaxed text-muted-foreground">افتح التطبيق من هاتفك لاستخدام البوصلة</p>
        </div>
      </div>
    </div>
    <!-- Offline state -->
    <div v-else-if="!online" :class="stateCardClass">
      <OfflineState />
    </div>
    <!-- Location loading -->
    <div v-else-if="locationLoading" :class="stateCardClass">
      <LoadingState message="جاري تحديد موقعك..." />
    </div>
    <button
      v-else-if="locationError"
      type="button"
      :class="[
        stateCardClass,
        'flex w-full flex-col items-center gap-4 px-4 py-10 text-center transition hover:bg-accent/50 active:scale-95',
      ]"
      @click="requestLocation"
    >
      <span class="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <IconLocationFilled class="size-6" />
      </span>
      <div class="space-y-1">
        <p class="text-base">{{ locationError }}</p>
        <p class="text-sm text-muted-foreground">إضغط للمحاولة مرة أخرى</p>
      </div>
    </button>
    <!-- Qibla API loading -->
    <div v-else-if="isFetching" :class="stateCardClass">
      <LoadingState message="جاري تحديد اتجاه القبلة..." />
    </div>
    <!-- Qibla API error -->
    <div v-else-if="error" :class="stateCardClass">
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
