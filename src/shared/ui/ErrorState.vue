<script setup>
import { toArabicNumerals } from '@/shared/utils/arabic'

defineProps({
  code: {
    type: Number,
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  message: {
    type: String,
    default: 'حدث خطأ، برجاء المحاولة في وقت لاحق.',
  },
})
</script>

<template>
  <!-- Centres itself, so it reads the same whether it is the whole page (404)
       or a block inside a card. -->
  <div class="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 py-8 text-center">
    <span v-if="icon" class="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
      <component :is="icon" class="size-6" />
    </span>

    <h1 v-if="code" class="font-display text-5xl leading-none">{{ toArabicNumerals(code) }}</h1>

    <p class="max-w-xs text-base leading-relaxed text-muted-foreground">{{ message }}</p>
  </div>
</template>
