<script setup>
import { computed } from 'vue'
import { IconShare3 } from '@tabler/icons-vue'
import { toast } from 'vue-sonner'
import { Button } from '@/shared/components/ui/button'

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

// Tailwind's preflight strips the browser heading sizes, so the level prop has
// to carry the type scale itself.
const sizeClasses = {
  1: 'text-4xl',
  2: 'text-3xl',
  3: 'text-2xl',
  4: 'text-xl',
  5: 'text-lg',
  6: 'text-base',
}

const titleClass = computed(() => sizeClasses[props.size] ?? sizeClasses[1])

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
    <component :is="`h${size}`" :class="titleClass">
      {{ title }}
      <Button
        v-if="share"
        variant="ghost"
        size="icon-sm"
        class="align-middle"
        type="button"
        title="مشاركة الصفحة"
        aria-label="مشاركة الصفحة"
        @click="sharePage"
      >
        <IconShare3 class="size-[1.125rem]" />
      </Button>
    </component>

    <p class="mt-2 mb-4 text-xl font-light text-muted-foreground" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>
