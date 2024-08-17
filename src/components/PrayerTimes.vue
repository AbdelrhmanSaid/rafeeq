<script setup>
import { computed } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { useFetch, useDateFormat } from '@vueuse/core'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

const timingsMap = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
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

  <table class="table table-bordered text-center" v-else-if="timings">
    <thead>
      <tr>
        <th v-for="(value, key) in timingsMap" :key="key">{{ value }}</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td v-for="(value, key) in timingsMap" :key="key" :data-label="value">
          {{ useDateFormat(timings.data.timings[key], 'hh:mm A').value.replace('AM', 'ص').replace('PM', 'م') }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="scss" scoped>
@media (max-width: 768px) {
  table {
    th {
      display: none;
    }

    td {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--bs-border-color);

      &:before {
        content: attr(data-label);
        font-weight: bold;
        display: block;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
