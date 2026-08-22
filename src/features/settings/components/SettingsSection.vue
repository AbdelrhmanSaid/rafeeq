<script setup>
import { Comment, Text, computed, useSlots, inject } from 'vue'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
})

const slots = useSlots()

// When rendered inside a "bare" context (e.g. a bottom sheet that supplies its
// own title/chrome) drop the card + header and render only the form body. Any
// SettingsSection-based card opts in automatically — no per-card changes.
const bare = inject('settings-bare', false)

// Whether the default slot renders anything meaningful (so we can drop the
// body wrapper entirely for header-only cards instead of leaving a gap).
const hasBody = computed(() => {
  const nodes = slots.default?.() ?? []
  return nodes.some((node) => {
    if (node.type === Comment) return false
    if (node.type === Text) return String(node.children).trim() !== ''
    return true
  })
})
</script>

<template>
  <div v-if="bare">
    <slot />
  </div>

  <Card v-else class="h-full gap-5">
    <CardHeader v-if="title || $slots.actions" class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2.5">
        <span v-if="icon" class="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <component :is="icon" :size="18" />
        </span>
        <div class="min-w-0">
          <CardTitle class="text-base leading-snug">{{ title }}</CardTitle>
          <CardDescription v-if="description" class="mt-0.5">{{ description }}</CardDescription>
        </div>
      </div>

      <CardAction v-if="$slots.actions" class="shrink-0 self-center">
        <slot name="actions" />
      </CardAction>
    </CardHeader>

    <CardContent v-if="hasBody">
      <slot />
    </CardContent>
  </Card>
</template>
