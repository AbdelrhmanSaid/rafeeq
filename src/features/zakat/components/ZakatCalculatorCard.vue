<script setup>
defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  result: { type: Object, required: true }, // { value, hint }
  conditionsTitle: { type: String, required: true },
  conditions: { type: Array, required: true },
})
</script>
<template>
  <div class="rounded-2xl bg-card p-5 text-card-foreground shadow-sm">
    <div class="mb-5 flex items-center gap-3">
      <span class="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:size-5">
        <component :is="icon" />
      </span>
      <h5 class="min-w-0 text-lg">{{ title }}</h5>
    </div>
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <slot />
      </div>
      <div class="lg:col-span-5">
        <div class="flex h-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-primary/10 p-5 text-center">
          <span class="text-sm text-muted-foreground">مقدار الزكاة</span>
          <span class="font-display text-2xl leading-tight text-balance text-primary tabular-nums sm:text-3xl">
            {{ result.value }}
          </span>
          <span class="text-xs text-muted-foreground">{{ result.hint }}</span>
        </div>
      </div>
    </div>
    <div class="mt-5 rounded-2xl bg-muted px-5 py-4">
      <h6 class="mb-2 text-base">{{ conditionsTitle }}</h6>
      <ul class="list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-muted-foreground">
        <li v-for="(condition, index) in conditions" :key="index">{{ condition }}</li>
      </ul>
    </div>
  </div>
</template>
