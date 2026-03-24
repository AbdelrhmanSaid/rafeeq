<script setup>
import { useThemeStore } from '@/stores/theme'
import { IconCheck, IconSunFilled, IconMoonStars, IconDeviceLaptop } from '@tabler/icons-vue'

const theme = useThemeStore()

const colors = [
  { label: 'الافتراضي', value: '' },
  { label: 'أخضر', value: '#1B5E20' },
  { label: 'فيروزي', value: '#00897B' },
  { label: 'أزرق', value: '#1565C0' },
  { label: 'كحلي', value: '#0D47A1' },
  { label: 'رملي', value: '#C2A878' },
]
</script>

<template>
  <div class="card h-100">
    <div class="card-body">
      <h6 class="card-title mb-3">المظهر</h6>

      <div class="btn-group-toggle mb-3">
        <button class="btn-toggle" :class="{ active: theme.mode === 'light' }" @click="theme.setMode('light')">
          <IconSunFilled :size="16" />
          <span>فاتح</span>
        </button>
        <button class="btn-toggle" :class="{ active: theme.mode === 'dark' }" @click="theme.setMode('dark')">
          <IconMoonStars :size="16" />
          <span>داكن</span>
        </button>
        <button class="btn-toggle" :class="{ active: theme.mode === 'system' }" @click="theme.setMode('system')">
          <IconDeviceLaptop :size="16" />
          <span>تلقائي</span>
        </button>
      </div>

      <div>
        <span class="d-block mb-2">اللون الأساسي</span>
        <div class="color-grid">
          <button
            v-for="color in colors"
            :key="color.value"
            class="color-option"
            :class="{ active: theme.primaryColor === color.value }"
            @click="theme.setPrimaryColor(color.value)"
          >
            <span class="color-dot" :style="{ background: color.value || '#795547' }">
              <IconCheck v-if="theme.primaryColor === color.value" :size="14" />
            </span>
            <span class="color-label">{{ color.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.5rem;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.25rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: none;
  cursor: pointer;
  transition: background 0.15s;
}

.color-option:hover {
  background: var(--bs-tertiary-bg);
}

.color-option.active {
  background: var(--bs-tertiary-bg);
  border-color: var(--bs-border-color);
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.color-label {
  font-size: 0.7rem;
  color: var(--bs-secondary-color);
}
</style>
