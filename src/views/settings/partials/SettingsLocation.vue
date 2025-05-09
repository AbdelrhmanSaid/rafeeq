<script setup>
import { computed } from 'vue'
import { useCoordinatesStore } from '@/stores/coordinates'
import { IconRefreshDot, IconTrash } from '@tabler/icons-vue'

const store = useCoordinatesStore()

const location = computed(() => {
  if (store.latitude === 0 || store.longitude === 0) {
    return 'لم يتم تحديد الموقع'
  }

  return `${store.latitude}, ${store.longitude}`
})
</script>

<template>
  <div class="input-group mb-3">
    <div class="form-floating">
      <input type="text" class="form-control" id="location" :value="location" readonly />
      <label for="location">الموقع</label>
    </div>

    <button type="button" class="input-group-text" @click="store.detect">
      <IconRefreshDot size="1.25rem" />
    </button>

    <button type="button" class="input-group-text" @click="store.clear">
      <IconTrash size="1.25rem" />
    </button>
  </div>
</template>
