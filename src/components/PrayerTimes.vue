<script setup>
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

const store = useCoordinatesStore()

if (store.latitude != 0 && store.longitude != 0) {
  const today = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
  const endpoint = `https://api.aladhan.com/v1/timings/${today}?latitude=${store.latitude}&longitude=${store.longitude}&iso8601=true`

  const { isFetching, data: timings, error } = useFetch(endpoint).json().get()
}
</script>

<template>
  <div v-if="store.latitude != 0 && store.longitude != 0">
    <div class="message-box" v-if="isFetching">
      <LoadingState />
    </div>

    <div class="message-box" v-else-if="error">
      <ErrorState :code="500" message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
    </div>

    <div class="timings" v-else-if="timings">
      <div class="item" v-for="(timing, key) in timingsMap" :key="key">
        <div class="item-title">{{ timing }}</div>
        <div class="item-time">{{ useDateFormat(timings.data.timings[key], 'hh:mm A') }}</div>
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
  min-height: 100px;
  text-align: center;
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
