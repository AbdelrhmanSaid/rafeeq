<script setup>
import { useTemplateRef } from 'vue'
import { IconShare3 } from '@tabler/icons-vue'
import { usePageHeader } from '@/layout/pageHeader'
import { sharePage } from '@/shared/utils/share'

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

// A page's h1 is its large title; the mobile app bar picks it up once it scrolls under the bar.
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
    <component ref="heading" :is="`h${size}`" class="d-flex align-items-end justify-content-between">
      {{ title }}
      <!-- On phones the app bar carries the share action. -->
      <button
        v-if="share"
        class="btn btn-soft btn-icon heading-share"
        :class="{ 'd-none d-md-inline-flex': size === 1 }"
        type="button"
        title="مشاركة الصفحة"
        aria-label="مشاركة الصفحة"
        @click="sharePage(title)"
      >
        <IconShare3 size="18" />
      </button>
    </component>

    <p class="lead" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.heading-share {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 50%;
}

.lead {
  color: var(--bs-secondary-color);
  font-size: 1.05rem;
}
</style>
