<script setup>
import { computed } from 'vue'
import { useAppearanceStore } from '@/stores/appearance'

const appearanceStore = useAppearanceStore()
const fontSizeLabel = computed(() => `${appearanceStore.fontSize}px`)
</script>

<template>
  <div class="card">
    <div class="card-body">
      <h6 class="card-title mb-3">المظهر</h6>

      <label class="form-label d-flex justify-content-between align-items-center" for="appFontSize">
        <span>حجم الخط</span>
        <span class="text-muted">{{ fontSizeLabel }}</span>
      </label>

      <input
        id="appFontSize"
        class="form-range"
        type="range"
        :min="appearanceStore.minFontSize"
        :max="appearanceStore.maxFontSize"
        step="1"
        :value="appearanceStore.fontSize"
        @input="appearanceStore.setFontSize(Number($event.target.value))"
      />

      <p class="text-muted small mb-0">يتم تطبيق حجم الخط على كامل التطبيق.</p>
    </div>
  </div>
</template>
