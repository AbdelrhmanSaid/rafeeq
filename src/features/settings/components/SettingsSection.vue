<script setup>
import { Comment, Text, computed, useSlots, inject } from 'vue'
import { cn } from '@/shared/lib/utils'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: [Object, Function], default: null },
  // Escape hatch for a body that supplies its own row padding (a `divide-y`
  // list of fields rather than a single padded block).
  bodyClass: { type: [String, Array, Object], default: '' },
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

  <!-- One rounded, borderless card per setting, split by hairline dividers
       rather than boxes: the header row states what the setting is and carries
       its inline control (a switch, a badge, a reset), and anything that needs
       more room lands in the body below the rule. A section that is nothing but
       a switch is therefore a single legible row. -->
  <section v-else class="divide-y overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm">
    <div v-if="title || $slots.actions" class="flex min-h-14 items-center gap-3 px-4 py-3">
      <span
        v-if="icon"
        class="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary [&_svg]:size-5"
      >
        <component :is="icon" />
      </span>

      <div class="min-w-0 flex-1">
        <h3 class="font-sans text-base leading-snug font-medium">{{ title }}</h3>
        <p v-if="description" class="mt-0.5 text-sm leading-relaxed text-pretty text-muted-foreground">
          {{ description }}
        </p>
      </div>

      <div v-if="$slots.actions" class="flex shrink-0 items-center">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="hasBody" :class="cn('p-4', bodyClass)">
      <slot />
    </div>
  </section>
</template>
