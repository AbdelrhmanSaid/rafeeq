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
    <p :class="`h${size}`">
        {{ title }}
        <button v-if="share" class="btn btn-flat p-0 bg-transparent" type="button" @click="sharePage">
          <IconShare3 size="18" />
        </button>
      </p>

    <p class="lead" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>
