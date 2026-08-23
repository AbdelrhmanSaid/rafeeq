<script setup>
import { computed, ref } from 'vue'
import { onLongPress } from '@vueuse/core'
import { IconCheck, IconCopy, IconDots, IconDownload, IconRestore, IconShare3 } from '@tabler/icons-vue'
import { exportComponent } from '@/shared/utils/export'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useZekrScroll } from '@/features/azkar/composables/useZekrScroll'
import { useZekrVibration } from '@/features/azkar/composables/useZekrVibration'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

import ZekrImage from './ZekrImage.vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  repeat: {
    type: Number,
    default: 1,
  },
  reference: {
    type: String,
  },
  benefit: {
    type: String,
  },
})

const count = defineModel('count', { type: Number, default: 0 })
const card = ref(null)
const isMobile = useIsMobile()
const { vibrateOnFinish } = useZekrVibration()
const { scrollToNextZekr } = useZekrScroll(card)

const done = computed(() => count.value >= props.repeat)

const increment = () => {
  if (count.value >= props.repeat) return

  // Compute the next value locally instead of re-reading the v-model: reading
  // `count.value` right after writing it can return a stale value, so the
  // completion branch (vibration + scroll to next) never ran.
  const next = count.value + 1
  count.value = next

  if (next === props.repeat) {
    vibrateOnFinish()
    scrollToNextZekr()
  }
}

const reset = () => {
  if (count.value > 0) count.value = 0
}

let longPressed = false

const onCardClick = () => {
  if (isMobile.value && !longPressed) increment()
  longPressed = false
}

onLongPress(
  card,
  (e) => {
    if (!isMobile.value || e.target.closest('.btn-counter, .action-menu, .btn-reset')) return
    longPressed = true
    increment()
  },
  { onMouseUp: () => setTimeout(() => (longPressed = false), 100) },
)

const exportAsImage = () => {
  toast.promise(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return exportComponent(ZekrImage, props, 'zekr')
    },
    {
      loading: 'جاري التصدير...',
      success: 'تم تصدير الصورة بنجاح',
      error: 'حدث خطأ أثناء تصدير الصورة',
    },
  )
}

const shareZekr = () => {
  toast.promise(() => navigator.share({ title: 'رفيق', text: props.text }), {
    loading: 'جاري المشاركة...',
    success: 'تم مشاركة الذكر بنجاح',
    error: 'حدث خطأ أثناء مشاركة الذكر',
  })
}

const copyZekr = () => {
  toast.promise(() => navigator.clipboard.writeText(props.text), {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الذكر بنجاح',
    error: 'حدث خطأ أثناء نسخ الذكر',
  })
}
</script>
<template>
  <div
    ref="card"
    class="zekr-card cursor-pointer overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm select-none lg:cursor-auto lg:select-auto"
    :class="{ 'opacity-75': done }"
    @click="onCardClick"
  >
    <div class="px-5 pt-6 pb-5 text-center lg:px-6">
      <p class="font-quran text-2xl leading-quran text-pretty sm:text-2xl">{{ text }}</p>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground" v-if="benefit || reference">
        <span v-if="reference">{{ reference }}</span>
        <span v-if="benefit && reference"> - </span>
        <span v-if="benefit">{{ benefit }}</span>
      </p>
    </div>
    <div class="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-3 py-3">
      <div class="btn-reset shrink-0" @click.stop>
        <Button
          class="size-11 rounded-full text-muted-foreground active:scale-90"
          variant="ghost"
          size="icon"
          type="button"
          :disabled="count === 0"
          aria-label="تصفير العداد"
          title="تصفير العداد"
          @click="reset"
        >
          <IconRestore class="size-5" />
        </Button>
      </div>
      <button
        class="btn-counter grid size-24 shrink-0 cursor-pointer place-items-center rounded-full text-lg font-medium text-primary tabular-nums transition outline-none select-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
        :class="{ 'is-done': done }"
        type="button"
        :aria-label="done ? 'اكتمل الذكر' : 'عد الذكر'"
        @click.stop="increment"
        :style="{ '--progress': count / repeat }"
      >
        <IconCheck v-if="done" class="size-7" />
        <template v-else>{{ toArabicNumerals(`${count}/${repeat}`) }}</template>
      </button>
      <div class="action-menu shrink-0" @click.stop>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              class="size-11 rounded-full text-muted-foreground active:scale-90"
              aria-label="خيارات الذكر"
            >
              <IconDots class="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="min-w-44 rounded-2xl border-0 p-1.5 shadow-xl">
            <DropdownMenuItem class="min-h-11 gap-3 rounded-xl px-3 text-sm" @click="exportAsImage">
              <IconDownload class="size-5" />
              <span>تنزيل</span>
            </DropdownMenuItem>
            <DropdownMenuItem class="min-h-11 gap-3 rounded-xl px-3 text-sm" @click="shareZekr">
              <IconShare3 class="size-5" />
              <span>مشاركة</span>
            </DropdownMenuItem>
            <DropdownMenuItem class="min-h-11 gap-3 rounded-xl px-3 text-sm" @click="copyZekr">
              <IconCopy class="size-5" />
              <span>نسخ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>
<style scoped>
.btn-counter {
  background:
    radial-gradient(closest-side, color-mix(in oklab, var(--primary) 10%, var(--card)) 78%, transparent 79% 100%),
    conic-gradient(var(--primary) calc(var(--progress) * 100%), color-mix(in oklab, var(--primary) 15%, transparent) 0);
}

.btn-counter.is-done {
  background:
    radial-gradient(closest-side, var(--primary) 78%, transparent 79% 100%),
    conic-gradient(var(--primary) 100%, var(--primary) 0);
  color: var(--primary-foreground);
}
</style>
