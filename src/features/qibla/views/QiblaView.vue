<script setup>
import { ref, computed, onMounted } from 'vue'
import { IconLocationFilled, IconDeviceMobile } from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import QiblaCompass from '@/features/qibla/components/QiblaCompass.vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useDeviceCompass } from '@/features/qibla/composables/useDeviceCompass'
import { getQiblaDirection } from '@/features/qibla/lib/qibla'

const isMobile = useIsMobile()

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

const qiblaDirection = computed(() => {
  if (latitude.value == null || longitude.value == null) return null
  return getQiblaDirection(latitude.value, longitude.value)
})

const { heading, hasSupport, error: compassError, canRequestPermission, requestPermission } = useDeviceCompass()

onMounted(requestLocation)
</script>

<template>
  <Page>
    <Heading class="mb-4" title="اتجاه القبلة" subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية." />

    <div class="card">
      <div v-if="!isMobile" class="qibla-card card-body qibla-card--static text-center">
        <IconDeviceMobile size="3rem" class="text-muted mb-3" />
        <p class="h5 mb-2">هذه الميزة متاحة فقط على الهاتف</p>
        <p class="text-muted mb-0">افتح التطبيق من هاتفك لاستخدام البوصلة</p>
      </div>

      <div v-else-if="locationLoading" class="qibla-card card-body qibla-card--static">
        <LoadingState message="جاري تحديد موقعك..." />
      </div>

      <div
        v-else-if="locationError"
        class="qibla-card card-body qibla-card--clickable text-center"
        @click="requestLocation"
      >
        <IconLocationFilled size="3rem" class="text-danger mb-3" />
        <p class="mb-2">{{ locationError }}</p>
        <p class="text-muted small mb-0">إضغط للمحاولة مرة أخرى</p>
      </div>

      <QiblaCompass
        v-else-if="qiblaDirection !== null"
        :qibla-direction="qiblaDirection"
        :heading="heading"
        :has-compass-support="hasSupport"
        :compass-error="compassError"
        :can-request-permission="canRequestPermission"
        @request-permission="requestPermission"
      />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.qibla-card {
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
