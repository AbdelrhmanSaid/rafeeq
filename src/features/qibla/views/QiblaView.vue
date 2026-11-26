<script setup>
import { ref, computed, onMounted } from 'vue'
import { IconLocationFilled } from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import QiblaCompass from '@/features/qibla/components/QiblaCompass.vue'
import { getCurrentPosition } from '@/shared/composables/useGeolocation'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { usePrayersStore } from '@/features/prayers/store'
import { useDeviceCompass } from '@/features/qibla/composables/useDeviceCompass'
import { getDistanceToKaaba, getQiblaDirection } from '@/features/qibla/lib/qibla'

const isMobile = useIsMobile()
const prayersStore = usePrayersStore()

const isCoordinate = (value) => Number.isFinite(Number(value)) && Number(value) !== 0

// The location saved for prayer times is good enough for the qibla, so only ask when there isn't one.
const latitude = ref(isCoordinate(prayersStore.latitude) ? Number(prayersStore.latitude) : null)
const longitude = ref(isCoordinate(prayersStore.longitude) ? Number(prayersStore.longitude) : null)
const locationLoading = ref(latitude.value == null)
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

const hasLocation = computed(() => latitude.value != null && longitude.value != null)
const qiblaDirection = computed(() => (hasLocation.value ? getQiblaDirection(latitude.value, longitude.value) : null))
const distance = computed(() => (hasLocation.value ? getDistanceToKaaba(latitude.value, longitude.value) : null))

const { heading, hasReading, error: compassError, canRequestPermission, requestPermission } = useDeviceCompass()

// Phones with a working compass follow the phone; anywhere else the screen shows the bearing and distance.
const live = computed(() => isMobile.value && hasReading.value && !compassError.value)

onMounted(() => {
  if (!hasLocation.value) requestLocation()
})
</script>

<template>
  <!-- One screen tall: the title, then the compass centred in the rest. -->
  <Page class="qibla-page full-height">
    <Heading
      subtitle-desktop-only
      title="اتجاه القبلة"
      subtitle="حدد اتجاه القبلة بسهولة باستخدام البوصلة الإلكترونية."
    />

    <div class="qibla-page__body">
      <LoadingState v-if="locationLoading" message="جاري تحديد موقعك..." />

      <button v-else-if="locationError" type="button" class="qibla-page__error" @click="requestLocation">
        <IconLocationFilled size="2.5rem" class="text-danger mb-3" />
        <span class="d-block mb-1">{{ locationError }}</span>
        <span class="d-block small text-body-secondary">اضغط للمحاولة مرة أخرى</span>
      </button>

      <QiblaCompass
        v-else-if="qiblaDirection !== null"
        :qibla-direction="qiblaDirection"
        :distance="distance"
        :heading="heading"
        :live="live"
        :compass-error="isMobile ? compassError : null"
        :can-request-permission="isMobile && canRequestPermission"
        @request-permission="requestPermission"
      />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.qibla-page {
  display: grid;
  grid-template-rows: auto 1fr;
}

.qibla-page__body {
  display: grid;
  place-items: center;
  padding-block: 1rem 2rem;
}

.qibla-page__error {
  padding: 1.5rem;
  border: 0;
  background: none;
  color: inherit;
  text-align: center;
}
</style>
