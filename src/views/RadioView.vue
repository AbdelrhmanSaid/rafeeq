<script setup>
import { ref, computed } from 'vue'
import { useRadioStore } from '@/stores/radio'
import { IconPlayerPlay, IconPlayerPause, IconMoodEmpty } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import radios from '@/databases/radios.json'

const search = ref('')
const stations = computed(() => radios.filter((item) => item.name.includes(search.value)))

const radio = useRadioStore()
</script>

<template>
  <PageLayout>
    <div class="d-flex align-items-end justify-content-between mb-4">
      <div>
        <h1>الإذاعة</h1>
        <p class="lead">استمع لإذاعات القرآن الكريم المختلفة حول العالم</p>
      </div>

      <div>
        <input v-model="search" type="text" class="form-control" placeholder="ابحث عن إذاعة..." />
      </div>
    </div>

    <ul class="list-group">
      <li
        v-for="(item, index) in stations"
        :key="index"
        class="list-group-item py-3"
        :class="{ active: radio.station === item.url }"
      >
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ index + 1 }}. {{ item.name }}</span>

          <button class="btn" @click="radio.stop()" v-if="radio.station === item.url">
            <IconPlayerPause size="1.25rem" />
          </button>

          <button class="btn" @click="radio.play(item.url)" v-else>
            <IconPlayerPlay size="1.25rem" />
          </button>
        </div>
      </li>

      <li v-if="stations.length === 0" class="list-group-item py-5 text-center">
        <IconMoodEmpty size="2.5rem" />
        <p class="mt-2">لا توجد نتائج مطابقة لعملية البحث</p>
      </li>
    </ul>
  </PageLayout>
</template>

<style lang="scss" scoped>
.list-group-item {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;

  &.active {
    background-color: var(--bs-primary);
    color: var(--bs-white);

    button {
      color: var(--bs-white);
    }
  }

  button,
  button:active,
  button:focus {
    border: none;
  }
}
</style>
