<script setup>
import { computed } from 'vue'
import { IconCircleCheckFilled, IconLoader2, IconDownload, IconTrash, IconX } from '@tabler/icons-vue'

const props = defineProps({
  asset: { type: Object, required: true },
  online: { type: Boolean, default: true },
})

defineEmits(['action'])

const ACTION_LABELS = {
  'downloaded': 'حذف',
  'queued': 'إلغاء تحميل',
  'downloading': 'جاري تحميل',
  'not-downloaded': 'تحميل',
}

const STATUS_LABELS = {
  downloaded: 'محمّل',
  downloading: 'جاري التحميل',
  queued: 'في الانتظار',
}

const actionLabel = computed(() => `${ACTION_LABELS[props.asset.status] ?? 'تحميل'} ${props.asset.name}`)
const disabled = computed(
  () => props.asset.status === 'downloading' || (!props.online && props.asset.status === 'not-downloaded'),
)
</script>

<template>
  <div class="download-row" :class="asset.status">
    <span class="download-row__text">
      <span class="download-row__name">{{ asset.name }}</span>
      <span v-if="STATUS_LABELS[asset.status]" class="download-row__status">
        <IconCircleCheckFilled v-if="asset.status === 'downloaded'" :size="14" aria-hidden="true" />
        {{ STATUS_LABELS[asset.status] }}
      </span>
    </span>

    <button
      type="button"
      class="download-row__action"
      :aria-label="actionLabel"
      :disabled="disabled"
      @click="$emit('action', asset)"
    >
      <IconTrash v-if="asset.status === 'downloaded'" :size="18" />
      <IconLoader2 v-else-if="asset.status === 'downloading'" :size="18" class="spin" />
      <IconX v-else-if="asset.status === 'queued'" :size="18" />
      <IconDownload v-else :size="18" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.download-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.25rem;
  padding-block: 0.25rem;
  padding-inline: 1rem 0.5rem;
  content-visibility: auto;
  contain-intrinsic-size: auto 3.25rem;

  & + & {
    border-top: 1px solid var(--app-hairline);
  }
}

.download-row__text {
  display: flex;
  flex: 1;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.download-row__name {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-row__status {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  align-self: center;
  gap: 0.25rem;
  color: var(--bs-secondary-color);
  font-size: 0.8rem;
}

.download-row.downloaded .download-row__status {
  color: var(--bs-success-text-emphasis);
}

.download-row.downloading .download-row__status {
  color: var(--app-primary-ink);
}

[data-bs-theme='dark'] .download-row.downloading .download-row__status {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.download-row__action {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--app-primary-ink);
  transition:
    background-color 0.15s,
    transform 0.15s var(--app-ease);

  &:active:not(:disabled) {
    background: var(--app-surface-active);
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
  }
}

[data-bs-theme='dark'] .download-row__action {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.download-row.downloaded .download-row__action,
.download-row.queued .download-row__action {
  color: var(--bs-secondary-color);
}

.download-row.downloading .download-row__action:disabled {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .download-row__action:hover:not(:disabled) {
    background: var(--app-surface-hover);
  }

  .download-row.downloaded .download-row__action:hover {
    color: var(--bs-danger);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
