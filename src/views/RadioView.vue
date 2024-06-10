<script setup>
import { ref, computed } from 'vue'
import { useRadioStore } from '@/stores/radio'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'

import PageLayout from '@/components/Layout/PageLayout.vue'
import EmptyState from '@/components/EmptyState.vue'

import radios from '@/exports/Radios.js'

const search = ref('')
const filtered = computed(() => radios.filter((item) => item.name.includes(search.value)))

const radio = useRadioStore()
</script>

<template>
  <PageLayout>
    <div class="mb-4">
      <div>
        <h1>الإذاعة</h1>
        <p class="lead">استمع لإذاعات القرآن الكريم المختلفة حول العالم</p>
      </div>

      <div class="form-floating">
        <input v-model="search" type="search" class="form-control" placeholder="ابحث عن إذاعة" />
        <label>تبحث عن إذاعة معينة؟</label>
      </div>
    </div>

    <ul class="list-group">
      <li
        v-for="station in filtered"
        :key="station.id"
        class="list-group-item"
        :class="{ active: radio.station === station.url }"
      >
        <div class="d-flex justify-content-between align-items-center">
          <span>{{ station.id }}. {{ station.name }}</span>

          <button class="btn btn-flat stretched-link" @click="radio.stop()" v-if="radio.station === station.url">
            <IconPlayerPause size="1.25rem" />
          </button>

          <button class="btn btn-flat stretched-link" @click="radio.play(station.url)" v-else>
            <IconPlayerPlay size="1.25rem" />
          </button>
        </div>
      </li>

      <li v-if="filtered.length === 0" class="list-group-item">
        <EmptyState />
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
}
</style>
