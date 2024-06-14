<script setup>
import { ref, watch } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'

import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'

import { to12HourFormat } from '@/utilities/arabic'

const store = useCoordinatesStore()
const loading = ref(false)
const timings = ref(null)
const error = ref(null)

const timingsMap = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
}

watch(() => store.latitude, fetchData, { immediate: true })

async function fetchData() {
  error.value = timings.value = null
  loading.value = true

  try {
    const today = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
    const endpoint = `https://api.aladhan.com/v1/timings/${today}?latitude=${store.latitude}&longitude=${store.longitude}`

    const response = await fetch(endpoint)
    const data = await response.json()

    timings.value = data.data.timings
  } catch (err) {
    error.value = err
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="store.latitude != 0 && store.longitude != 0">
    <div class="message-box" v-if="loading">
      <LoadingState />
    </div>

    <div class="message-box" v-else-if="error">
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
    </div>

    <div class="timings" v-else-if="timings">
      <div class="item" v-for="(timing, key) in timingsMap" :key="key">
        <div class="item-title">{{ timing }}</div>
        <div class="item-time">{{ to12HourFormat(timings[key]) }}</div>
      </div>
    </div>
  </div>

  <div class="message-box cursor-pointer text-muted" @click="store.detect()" v-else>
    <span>إضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة</span>
  </div>
</template>

<style lang="scss" scoped>
.message-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--bs-border-color);
  border-radius: 0.25rem;
  padding: 1.5rem 1rem;
}

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
      font-weight: 700;
    }
  }
}
</style>
