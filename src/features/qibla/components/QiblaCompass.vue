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
  <div class="flex flex-col items-center gap-8 py-2">
    <!-- The dial. It is the hero of the screen, so it takes as much width as the
         phone allows and lifts off the page instead of being boxed in; locking
         on to the Qibla swaps the resting hairline for a soft success halo. -->
    <div
      class="relative grid size-[min(17rem,78vw)] place-items-center rounded-full bg-card shadow-md transition-shadow duration-300"
      :class="isFacingQibla ? 'ring-4 ring-success/30' : 'ring-1 ring-border'"
    >
      <div class="pointer-events-none absolute inset-5 rounded-full ring-1 ring-border/60"></div>

      <!-- Qibla needle - points to Qibla direction. The rotation is compass
           geometry, not layout direction, so it is never RTL-flipped; the needle
           is centred with `inset-x-0 mx-auto` and pivots on the dial centre. -->
      <div
        class="absolute inset-x-0 top-0 mx-auto flex h-1/2 w-1 origin-bottom flex-col items-center will-change-transform"
        :style="{ transform: `rotate(${needleRotation}deg)` }"
      >
        <!-- CSS-triangle arrowhead -->
        <div class="size-0 border-x-[0.625rem] border-b-[1.5rem] border-x-transparent border-b-primary"></div>
        <div class="mt-1.5 text-3xl">🕋</div>
      </div>

      <!-- Center dot -->
      <div class="absolute inset-0 z-10 m-auto size-3.5 rounded-full bg-primary ring-4 ring-card"></div>

      <!-- "You" indicator at bottom -->
      <div
        class="absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm"
      >
        <span>أنت</span>
      </div>
    </div>

    <!-- Readout -->
    <div class="flex flex-col items-center gap-3 text-center">
      <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
        <IconCompass class="size-5 shrink-0" />
        <span class="text-lg font-medium tabular-nums">
          {{ toArabicNumerals(qiblaDirection.toFixed(1)) }}° من الشمال
        </span>
      </div>

      <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
        <template v-if="hasCompassSupport && !compassError">
          <span v-if="isFacingQibla" class="font-medium text-success">أنت تواجه القبلة!</span>
          <span v-else>أدر هاتفك حتى تشير الكعبة للأعلى</span>
        </template>
        <template v-else>
          <span class="text-destructive">{{ compassError || 'البوصلة غير متاحة' }}</span>
        </template>
      </p>
    </div>

    <!-- Enable compass button for iOS -->
    <Button
      v-if="canRequestPermission"
      class="h-12 gap-2 rounded-full px-6 shadow-sm active:scale-[0.98]"
      @click="$emit('request-permission')"
    >
      <IconCompass class="size-5" />
      تفعيل البوصلة
    </Button>
  </div>
</template>
