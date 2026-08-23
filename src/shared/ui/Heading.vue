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

const sizeClasses = {
  1: 'text-3xl sm:text-4xl',
  2: 'text-2xl sm:text-3xl',
  3: 'text-xl sm:text-2xl',
  4: 'text-lg sm:text-xl',
  5: 'text-base sm:text-lg',
  6: 'text-sm sm:text-base',
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
    <div class="flex items-start justify-between gap-2">
      <component :is="`h${size}`" :class="titleClass" class="min-w-0 flex-1 text-balance">
        {{ title }}
      </component>
      <Button
        v-if="share"
        variant="ghost"
        size="icon"
        class="-me-2 size-11 shrink-0 rounded-full text-muted-foreground active:scale-95"
        type="button"
        title="مشاركة الصفحة"
        aria-label="مشاركة الصفحة"
        @click="sharePage"
      >
        <IconShare3 class="size-5" />
      </Button>
    </div>
    <p class="mt-1.5 mb-5 max-w-prose text-sm leading-relaxed text-pretty text-muted-foreground" v-if="subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>
