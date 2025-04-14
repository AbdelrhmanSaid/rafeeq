<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { useFetch, useDateFormat } from '@vueuse/core'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

// Import prayer icons
import Fajr from './icons/Prayers/Fajr.vue'
import Shurooq from './icons/Prayers/Shurooq.vue'
import Duhur from './icons/Prayers/Duhur.vue'
import Asr from './icons/Prayers/Asr.vue'
import Maghrib from './icons/Prayers/Maghrib.vue'
import Ishaa from './icons/Prayers/Ishaa.vue'

// Current Time and Active Prayer
const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 60 * 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

const timingsMap = {
  Fajr: {
    label: 'الفجر',
    icon: Fajr,
  },
  Sunrise: {
    label: 'الشروق',
    icon: Shurooq,
  },
  Dhuhr: {
    label: 'الظهر',
    icon: Duhur,
  },
  Asr: {
    label: 'العصر',
    icon: Asr,
  },
  Maghrib: {
    label: 'المغرب',
    icon: Maghrib,
  },
  Isha: {
    label: 'العشاء',
    icon: Ishaa,
  },
}

// Get the coordinates store
const store = useCoordinatesStore()

// Get the API endpoint
const endpoint = computed(() => {
  if (store.latitude == 0 || store.longitude == 0) {
    return null
  }

  // Build the API endpoint using the current date
  const today = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
  const url = `https://api.aladhan.com/v1/timings/${today}?latitude=${store.latitude}&longitude=${store.longitude}&iso8601=true`

  return url
})

const options = {
  refetch: true,
  beforeFetch: ({ url, cancel }) => {
    if (url == null) {
      cancel()
    }
  },
}

// Start fetching the data
const { isFetching, data: timings, error } = useFetch(endpoint, options).json().get()

// Format time to proper format
const formatTime = (time) => {
  time = useDateFormat(time, 'hh:mm A').value
  time = time.replace('AM', 'صباحًا').replace('PM', 'مساءً')

  return time
}

// Get the next prayer key
const nextPrayerKey = computed(() => {
  if (!timings.value?.data?.timings) {
    return null
  }

  const prayerTimes = timings.value.data.timings
  const currentTime = now.value.getTime()

  // Define all prayers in sequential order
  const prayers = [
    { name: 'Fajr', time: new Date(prayerTimes.Fajr).getTime() },
    { name: 'Sunrise', time: new Date(prayerTimes.Sunrise).getTime() },
    { name: 'Dhuhr', time: new Date(prayerTimes.Dhuhr).getTime() },
    { name: 'Asr', time: new Date(prayerTimes.Asr).getTime() },
    { name: 'Maghrib', time: new Date(prayerTimes.Maghrib).getTime() },
    { name: 'Isha', time: new Date(prayerTimes.Isha).getTime() },
  ]

  // Find the next prayer
  for (let i = 0; i < prayers.length - 1; i++) {
    if (currentTime >= prayers[i].time && currentTime < prayers[i + 1].time) {
      return prayers[i + 1].name
    }
  }

  // Handle overnight case (between Isha and Fajr)
  if (currentTime >= prayers[prayers.length - 1].time || currentTime < prayers[0].time) {
    return prayers[0].name // Return Fajr as the next prayer
  }

  return null
})
</script>

<template>
  <div
    v-if="store.latitude == 0 || store.longitude == 0"
    class="border rounded p-5 text-center cursor-pointer"
    @click="store.detect()"
  >
    <span>إضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة</span>
  </div>

  <div class="border rounded p-5" v-else-if="isFetching">
    <LoadingState />
  </div>

  <div class="border rounded p-5" v-else-if="error">
    <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
  </div>

  <div class="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-2" v-else-if="timings">
    <div v-for="(timing, key) in timingsMap" :key="key">
      <div class="card" :class="{ active: key === nextPrayerKey }">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 mb-3">
            <component :is="timing.icon" />
            <h5 class="card-title mb-0">{{ timing.label }}</h5>
          </div>

          <p class="card-text">
            {{ formatTime(timings.data.timings[key]) }}
          </p>
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
