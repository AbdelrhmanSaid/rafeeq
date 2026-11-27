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
  // List screens drop the subtitle on phones so the list starts higher.
  subtitleDesktopOnly: {
    type: Boolean,
    default: false,
  },
})

const heading = useTemplateRef('heading')

// The app bar shows the h1's title, and its share action, once it scrolls under the bar.
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
    <component ref="heading" :is="`h${size}`" :class="{ 'heading--solo-mobile': subtitleDesktopOnly }">
      {{ title }}
    </component>

    <p v-if="subtitle" class="lead" :class="{ 'd-none d-lg-block': subtitleDesktopOnly }">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.lead {
  color: var(--bs-secondary-color);
  font-size: 1.05rem;
}

@media (max-width: 991.98px) {
  .heading--solo-mobile {
    margin-bottom: 1rem;
  }
}
</style>
