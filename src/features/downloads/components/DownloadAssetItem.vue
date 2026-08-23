<script setup>
import { IconBook2, IconSparkles, IconCheck, IconLoader2, IconDownload } from '@tabler/icons-vue'

defineProps({
  asset: { type: Object, required: true },
  online: { type: Boolean, default: true },
})

defineEmits(['action'])
</script>

<template>
  <div class="dm-item" :class="asset.status">
    <span class="icon-tile dm-item-icon" :class="asset.type">
      <IconBook2 v-if="asset.type === 'surah'" :size="18" />
      <IconSparkles v-else :size="18" />
    </span>

    <div class="dm-item-info">
      <span class="dm-item-name">{{ asset.name }}</span>
      <span class="dm-item-type">{{ asset.type === 'surah' ? 'سورة' : 'أذكار' }}</span>
    </div>

    <button
      class="dm-item-action"
      :class="asset.status"
      @click="$emit('action', asset)"
      :disabled="asset.status === 'downloading' || (!online && asset.status === 'not-downloaded')"
    >
      <IconCheck v-if="asset.status === 'downloaded'" :size="16" />
      <IconLoader2 v-else-if="asset.status === 'downloading'" :size="16" class="spin" />
      <span v-else-if="asset.status === 'queued'" class="queued-dot"></span>
      <IconDownload v-else :size="16" />
    </button>
  </div>
</template>

<style scoped>
.dm-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  border-bottom: 1px solid var(--app-hairline);
  transition: background-color 0.2s ease;
}

.dm-item:last-child {
  border-bottom: none;
}

.dm-item:hover {
  background: var(--app-surface-hover);
}

.dm-item.downloaded {
  background: color-mix(in srgb, var(--bs-success) 7%, transparent);
}

.dm-item.downloading {
  background: var(--app-tint);
}

.dm-item-icon {
  width: 2.25rem;
  height: 2.25rem;
}

.dm-item-icon.surah {
  color: var(--bs-primary);
}

.dm-item-icon.azkar {
  color: var(--bs-success);
}

[data-bs-theme='dark'] .dm-item-icon.surah {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}

.dm-item-info {
  flex: 1;
  min-width: 0;
}

.dm-item-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dm-item-type {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

.dm-item-action {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s,
    color 0.15s,
    transform 0.15s var(--app-ease);
}

.dm-item-action:active:not(:disabled) {
  transform: scale(0.92);
}

.dm-item-action.not-downloaded {
  background: var(--app-tint);
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .dm-item-action.not-downloaded {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.dm-item-action.not-downloaded:hover:not(:disabled) {
  background: var(--bs-primary);
  color: #fff;
}

.dm-item-action.downloaded {
  background: var(--bs-success);
  color: #fff;
}

.dm-item-action.downloaded:hover {
  background: var(--bs-danger);
}

.dm-item-action.downloading {
  background: var(--bs-primary);
  color: #fff;
}

.dm-item-action.queued {
  background: rgba(var(--bs-secondary-rgb), 0.1);
  color: var(--bs-secondary-color);
}

.dm-item-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.queued-dot {
  width: 8px;
  height: 8px;
  background: var(--bs-secondary-color);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>
