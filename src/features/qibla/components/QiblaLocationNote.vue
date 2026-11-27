<script setup>
import { computed } from 'vue'

const props = defineProps({
  distance: { type: Number, default: null },
  savedLocation: { type: Boolean, default: false },
  refreshingLocation: { type: Boolean, default: false },
  impreciseLocation: { type: Boolean, default: false },
})

defineEmits(['refresh-location'])

const distanceLabel = computed(() =>
  props.distance == null ? '' : `${Math.round(props.distance).toLocaleString('ar-EG')} كم إلى مكة`,
)

const doubt = computed(() => {
  if (props.savedLocation) return 'حسب موقعك المحفوظ'
  return props.impreciseLocation ? 'موقعك غير دقيق' : ''
})
</script>

<template>
  <p v-if="distanceLabel" class="qibla-note">{{ distanceLabel }}</p>
  <p v-if="doubt && refreshingLocation" class="qibla-note">{{ doubt }} · جاري تحديث الموقع…</p>
  <button v-else-if="doubt" type="button" class="qibla-note__refresh" @click="$emit('refresh-location')">
    {{ doubt }} · تحديث الموقع
  </button>
</template>

<style lang="scss" scoped>
.qibla-note {
  margin: 0;
  color: var(--bs-secondary-color);
  font-size: 0.875rem;
}

/* The compass passes its accent down (gold while facing the qibla); elsewhere it's the brand ink. */
.qibla-note__refresh {
  min-height: 2.75rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 0;
  background: none;
  color: var(--qibla-accent, var(--app-primary-ink));
  font-size: 0.875rem;
}

[data-bs-theme='dark'] .qibla-note__refresh {
  color: var(--qibla-accent, color-mix(in srgb, var(--bs-primary) 35%, #fff));
}
</style>
