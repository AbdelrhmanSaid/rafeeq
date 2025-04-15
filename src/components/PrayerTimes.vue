<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { useFetch, useDateFormat } from '@vueuse/core'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

// Import prayer icons
import Fajr from '@/components/icons/Prayers/Fajr.vue'
import Shurooq from '@/components/icons/Prayers/Shurooq.vue'
import Duhur from '@/components/icons/Prayers/Duhur.vue'
import Asr from '@/components/icons/Prayers/Asr.vue'
import Maghrib from '@/components/icons/Prayers/Maghrib.vue'
import Ishaa from '@/components/icons/Prayers/Ishaa.vue'

// Reactive state for current time
const now = ref(new Date())
let timer = null

// Update current time every minute
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60 * 1000)))
onUnmounted(() => timer && clearInterval(timer))

// Prayer timings map
const timingsMap = {
  Fajr: { label: 'الفجر', icon: Fajr },
  Sunrise: { label: 'الشروق', icon: Shurooq },
  Dhuhr: { label: 'الظهر', icon: Duhur },
  Asr: { label: 'العصر', icon: Asr },
  Maghrib: { label: 'المغرب', icon: Maghrib },
  Isha: { label: 'العشاء', icon: Ishaa },
}

// Coordinates store
const store = useCoordinatesStore()

// API endpoint
const endpoint = computed(() => {
  if (!store.latitude || !store.longitude) return null
  const today = new Date().toISOString().split('T')[0].split('-').reverse().join('-')
  return `https://api.aladhan.com/v1/timings/${today}?latitude=${store.latitude}&longitude=${store.longitude}&iso8601=true`
})

// Fetch options
const options = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (!url) cancel()
  },
}

// Fetch prayer timings
const { isFetching, data: timings, error } = useFetch(endpoint, options).json().get()

// Format time
const formatTime = (time) => {
  return useDateFormat(time, 'hh:mm A').value.replace('AM', 'صباحًا').replace('PM', 'مساءً')
}

// Determine the next prayer
const nextPrayerKey = computed(() => {
  if (!timings.value?.data?.timings) return null

  const prayerTimes = timings.value.data.timings
  const currentTime = now.value.getTime()

  const prayers = Object.entries(prayerTimes).map(([name, time]) => ({
    name: name,
    time: new Date(time).getTime(),
  }))

  for (let i = 0; i < prayers.length - 1; i++) {
    if (currentTime >= prayers[i].time && currentTime < prayers[i + 1].time) {
      return prayers[i + 1].name
    }
  }

  return currentTime >= prayers[prayers.length - 1].time || currentTime < prayers[0].time ? prayers[0].name : null
})
</script>

<template>
  <div
    v-if="store.latitude === 0 || store.longitude === 0"
    class="border rounded p-5 text-center cursor-pointer"
    @click="store.detect"
  >
    <span>إضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة</span>
  </div>

  <div v-else-if="isFetching" class="border rounded p-5">
    <LoadingState />
  </div>

  <div v-else-if="error" class="border rounded p-5">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </div>

  <div v-else-if="timings" class="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-2">
    <div v-for="(timing, key) in timingsMap" :key="key">
      <div class="card" :class="{ active: key === nextPrayerKey }">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 mb-3">
            <component :is="timing.icon" />
            <h5 class="card-title mb-0">{{ timing.label }}</h5>
          </div>
          <p class="card-text">{{ formatTime(timings.data.timings[key]) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card.active {
  border-color: var(--bs-primary);
  background-color: var(--bs-primary);
  color: #fff;
}
</style>
