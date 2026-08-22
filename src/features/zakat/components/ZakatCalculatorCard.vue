<script setup>
import { Card, CardContent } from '@/shared/components/ui/card'

defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  result: { type: Object, required: true }, // { value, hint }
  conditionsTitle: { type: String, required: true },
  conditions: { type: Array, required: true },
})
</script>

<template>
  <Card class="mb-4">
    <CardContent>
      <div class="mb-4 flex items-center gap-3">
        <span class="grid size-11 shrink-0 place-items-center rounded-full border text-primary [&_svg]:size-6">
          <component :is="icon" />
        </span>
        <h5 class="text-lg">{{ title }}</h5>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <slot />
        </div>

        <div class="lg:col-span-5">
          <div
            class="flex h-full flex-col items-center justify-center gap-1.5 rounded-lg border border-primary p-6 text-center"
          >
            <span class="text-sm text-muted-foreground">مقدار الزكاة</span>
            <span class="text-[clamp(1.5rem,4vw,2rem)] leading-tight font-bold">{{ result.value }}</span>
            <span class="text-xs text-muted-foreground">{{ result.hint }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 rounded-md border px-5 py-4 text-sm">
        <h6 class="mb-2 text-base">{{ conditionsTitle }}</h6>
        <ul class="list-disc ps-5">
          <li v-for="(condition, index) in conditions" :key="index">{{ condition }}</li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>
