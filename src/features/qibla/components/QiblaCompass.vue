<script setup>
import { computed } from 'vue'
import { IconCompass } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import {
  needleRotation as computeNeedleRotation,
  isFacingQibla as computeIsFacingQibla,
} from '@/features/qibla/lib/qibla'

// 15° tolerance allows natural hand movement while staying precise for prayer.
const FACING_TOLERANCE = 15

const props = defineProps({
  qiblaDirection: { type: Number, required: true },
  heading: { type: Number, default: 0 },
  hasCompassSupport: { type: Boolean, default: false },
  compassError: { type: String, default: null },
  canRequestPermission: { type: Boolean, default: false },
})

defineEmits(['request-permission'])

const needleRotation = computed(() => computeNeedleRotation(props.qiblaDirection, props.heading))
const isFacingQibla = computed(
  () => props.hasCompassSupport && computeIsFacingQibla(needleRotation.value, FACING_TOLERANCE),
)
</script>

<template>
  <div class="qibla-shell">
    <div class="compass-container" :class="{ 'facing-qibla': isFacingQibla }">
      <!-- Qibla needle - points to Qibla direction -->
      <div class="needle" :style="{ transform: `rotate(${needleRotation}deg)` }">
        <div class="needle-pointer"></div>
        <div class="kaaba-icon">🕋</div>
      </div>

      <!-- Center dot -->
      <div class="center-dot"></div>

      <!-- "You" indicator at bottom -->
      <div class="you-indicator">
        <span>أنت</span>
      </div>
    </div>

    <!-- Info section -->
    <div class="qibla-info">
      <div class="qibla-degree">
        <IconCompass size="1.25rem" class="me-2" />
        <span>{{ toArabicNumerals(qiblaDirection.toFixed(1)) }}° من الشمال</span>
      </div>
      <p class="qibla-hint">
        <template v-if="hasCompassSupport && !compassError">
          <span v-if="isFacingQibla" class="text-success fw-bold">أنت تواجه القبلة!</span>
          <span v-else>أدر هاتفك حتى تشير الكعبة للأعلى</span>
        </template>
        <template v-else>
          <span class="text-warning">{{ compassError || 'البوصلة غير متاحة' }}</span>
        </template>
      </p>
    </div>

    <!-- Enable compass button for iOS -->
    <button v-if="canRequestPermission" class="btn btn-primary" @click="$emit('request-permission')">
      <IconCompass class="me-2" size="1.25rem" />
      تفعيل البوصلة
    </button>
  </div>
</template>

<style lang="scss" scoped>
.qibla-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 1rem;
}

.compass-container {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bs-body-bg) 0%, var(--bs-secondary-bg) 100%);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.1),
    inset 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 3px solid var(--bs-border-color);
  transition:
    border-color 0.3s,
    box-shadow 0.3s;

  &.facing-qibla {
    border-color: var(--bs-success);
    box-shadow:
      0 0 0 4px rgba(var(--bs-success-rgb), 0.2),
      0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 50%;
  margin-left: -2px;
  margin-top: -50%;
  transform-origin: bottom center;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

.needle-pointer {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 24px solid var(--bs-primary);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.kaaba-icon {
  font-size: 1.75rem;
  margin-top: 4px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.15));
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: var(--bs-primary);
  border-radius: 50%;
  border: 3px solid var(--bs-body-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.you-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bs-primary);
  color: white;
  padding: 4px 12px;
  border-radius: var(--bs-border-radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
}

.qibla-info {
  text-align: center;
}

.qibla-degree {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--bs-primary);
  margin-bottom: 0.5rem;
}

.qibla-hint {
  color: var(--bs-secondary-color);
  margin: 0;
  font-size: 1rem;
}
</style>
