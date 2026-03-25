<script setup>
import { computed } from 'vue'
import { usePrayersStore } from '@/stores/prayers'
import { IconRefreshDot, IconTrash, IconLayoutList, IconLayoutGrid } from '@tabler/icons-vue'

const store = usePrayersStore()

const location = computed(() => {
  if (store.latitude === 0 || store.longitude === 0) {
    return 'لم يتم تحديد الموقع'
  }

  return `${store.latitude}, ${store.longitude}`
})
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h6 class="card-title mb-3">مواقيت الصلاة</h6>

      <div class="mb-3">
        <span class="d-block mb-2">الموقع</span>
        <div class="input-group">
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
      </div>

      <div>
        <span class="d-block mb-2">طريقة العرض</span>
        <div class="btn-group-toggle">
          <button class="btn-toggle" :class="{ active: !store.vertical }" @click="store.vertical = false">
            <IconLayoutGrid :size="16" />
            <span>بطاقات</span>
          </button>
          <button class="btn-toggle" :class="{ active: store.vertical }" @click="store.vertical = true">
            <IconLayoutList :size="16" />
            <span>قائمة</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
