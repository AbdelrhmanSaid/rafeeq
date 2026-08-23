<script setup>
import { ref } from 'vue'
import { IconRefreshDot } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { toArabicNumerals } from '@/shared/utils/arabic'

const sebha = ref(0)
</script>

<template>
  <!-- One-handed screen: the reset sits up top, out of the way, and the counter
       itself owns the lower half where the thumb lands. -->
  <div class="flex flex-col items-center justify-center gap-8 py-2 text-center">
    <Button
      variant="ghost"
      class="h-11 gap-2 rounded-full px-5 text-muted-foreground active:scale-[0.98]"
      @click="sebha = 0"
    >
      <IconRefreshDot class="size-5" />
      <span>إعادة العداد</span>
    </Button>

    <!-- rem (not px) so the circle grows with the font scale, capped by viewport
         width on small screens. The whole disc is the tap target, and the only
         press feedback is its own scale — the body kills the tap highlight. -->
    <button
      type="button"
      @click="sebha++"
      class="relative grid size-[min(17.5rem,76vw)] shrink-0 place-items-center rounded-full bg-card text-primary shadow-md transition duration-150 select-none active:scale-[0.97] active:bg-accent active:shadow-sm"
    >
      <span class="pointer-events-none absolute inset-3 rounded-full ring-1 ring-primary/15"></span>

      <span class="flex flex-col items-center gap-2">
        <span class="font-display text-6xl leading-none tabular-nums sm:text-7xl">{{ toArabicNumerals(sebha) }}</span>
        <span class="text-sm text-muted-foreground">اضغط للتسبيح</span>
      </span>
    </button>

    <span class="text-sm text-muted-foreground">استمر بالذكر، واحتسب الأجر</span>
  </div>
</template>
