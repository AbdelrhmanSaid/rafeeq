<script setup>
import { computed } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { useFetch, useDateFormat } from '@vueuse/core'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const timingsMap = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
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

  <div class="timings" v-else-if="timings">
    <div class="item" v-for="(timing, key) in timingsMap" :key="key">
      <div class="item-title">{{ timing }}</div>

      <div class="item-time">
        {{ useDateFormat(timings.data.timings[key], 'hh:mm A').value.replace('AM', 'ص').replace('PM', 'م') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.25rem;

    .item-title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .item-time {
      font-size: 1.5rem;
    }
  }
}
</style>
