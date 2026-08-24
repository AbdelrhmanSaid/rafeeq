<script setup>
import { IconShare3 } from '@tabler/icons-vue'
import { toast } from 'vue-sonner'

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

const sharePage = async () => {
  const data = {
    title: props.title,
    text: props.title,
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(data)
    } catch {
      // User cancelled
    }
  } else {
    try {
      await navigator.clipboard.writeText(data.url)
      toast.success('تم نسخ الرابط')
    } catch {
      toast.error('حدث خطأ أثناء نسخ الرابط')
    }
  }
}
</script>

<template>
  <div>
    <component :is="`h${size}`" class="d-flex align-items-end justify-content-between">
      {{ title }}
      <button
        v-if="share"
        class="btn btn-soft btn-icon heading-share"
        type="button"
        title="مشاركة الصفحة"
        aria-label="مشاركة الصفحة"
        @click="sharePage"
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
