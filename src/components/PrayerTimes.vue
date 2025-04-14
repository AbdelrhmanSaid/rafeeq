<script setup>
import { computed } from 'vue'
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
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 mb-3">
            <component :is="timing.icon" />
            <h5 class="card-title mb-0">{{ timing.label }}</h5>
          </div>

          <p class="card-text">
            {{
              useDateFormat(timings.data.timings[key], 'hh:mm A').value.replace('AM', 'صباحًا').replace('PM', 'مساءًا')
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
