<script setup>
import { computed } from 'vue'
import { IconCompass } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
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
  <div class="flex flex-col items-center gap-6 px-4 py-6">
    <div
      class="relative size-65 rounded-full border-4 bg-linear-to-br from-background to-secondary shadow-lg transition-[border-color,box-shadow] duration-300"
      :class="{ 'border-success ring-4 ring-success/20': isFacingQibla }"
    >
      <!-- Qibla needle - points to Qibla direction. The rotation is compass
           geometry, not layout direction, so it is never RTL-flipped; the needle
           is centred with `inset-x-0 mx-auto` and pivots on the dial centre. -->
      <div
        class="absolute inset-x-0 top-0 mx-auto flex h-1/2 w-1 origin-bottom flex-col items-center will-change-transform"
        :style="{ transform: `rotate(${needleRotation}deg)` }"
      >
        <!-- CSS-triangle arrowhead -->
        <div class="size-0 border-x-[0.625rem] border-b-[1.5rem] border-x-transparent border-b-primary"></div>
        <div class="mt-1 text-3xl">🕋</div>
      </div>

      <!-- Center dot -->
      <div class="absolute inset-0 z-10 m-auto size-3.5 rounded-full border-2 border-background bg-primary"></div>

      <!-- "You" indicator at bottom -->
      <div
        class="absolute inset-x-0 bottom-5 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
      >
        <span>أنت</span>
      </div>
    </div>

    <!-- Info section -->
    <div class="text-center">
      <div class="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-primary">
        <IconCompass class="size-5" />
        <span>{{ toArabicNumerals(qiblaDirection.toFixed(1)) }}° من الشمال</span>
      </div>
      <p class="text-base text-muted-foreground">
        <template v-if="hasCompassSupport && !compassError">
          <span v-if="isFacingQibla" class="font-bold text-success">أنت تواجه القبلة!</span>
          <span v-else>أدر هاتفك حتى تشير الكعبة للأعلى</span>
        </template>
        <template v-else>
          <span class="text-destructive">{{ compassError || 'البوصلة غير متاحة' }}</span>
        </template>
      </p>
    </div>

    <!-- Enable compass button for iOS -->
    <Button v-if="canRequestPermission" @click="$emit('request-permission')">
      <IconCompass class="size-5" />
      تفعيل البوصلة
    </Button>
  </div>
</template>
