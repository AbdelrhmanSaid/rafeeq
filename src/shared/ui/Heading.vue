<script setup>
import { useTemplateRef } from 'vue'
import { usePageHeader } from '@/layout/pageHeader'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  size: {
    type: Number,
    default: 1,
  },
  share: {
    type: Boolean,
    default: false,
  },
})

const heading = useTemplateRef('heading')

// A page's h1 is its large title; the app bar picks it up once it scrolls under the bar, and carries its share action.
if (props.size === 1) {
  usePageHeader({
    title: () => props.title,
    share: () => props.share,
    el: heading,
  })
}
</script>

<template>
  <div>
    <component ref="heading" :is="`h${size}`">
      {{ title }}
    </component>

    <p class="lead" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.lead {
  color: var(--bs-secondary-color);
  font-size: 1.05rem;
}
</style>
