<script setup>
import { ref } from 'vue'
import { IconRefreshDot } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { toArabicNumerals } from '@/shared/utils/arabic'

const sebha = ref(0)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-7 px-4 pt-8 pb-12 text-center">
    <!-- rem (not px) so the circle grows with the font scale and the counter
         never overflows; still capped by viewport width on small screens. -->
    <button
      type="button"
      @click="sebha++"
      class="flex size-[min(13.75rem,70vw)] flex-col items-center justify-center gap-1.5 rounded-full border bg-background text-primary shadow-lg transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-xl active:translate-y-0"
    >
      <span class="text-[clamp(2rem,4vw,2.75rem)] font-bold">{{ toArabicNumerals(sebha) }}</span>
      <span class="text-sm text-muted-foreground">اضغط للتسبيح</span>
    </button>

    <div class="grid justify-items-center gap-3">
      <Button variant="ghost" @click="sebha = 0">
        <IconRefreshDot class="size-5" />
        <span>إعادة العداد</span>
      </Button>
      <span class="text-sm text-muted-foreground">استمر بالذكر، واحتسب الأجر</span>
    </div>
  </div>
</template>
