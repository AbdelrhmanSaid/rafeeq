<script setup>
import { ref } from 'vue'
import { onLongPress } from '@vueuse/core'
import { IconDownload, IconShare3, IconCopy, IconHeartShare, IconRestore } from '@tabler/icons-vue'
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
  DropdownMenuSeparator,
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

// Mobile long presses often emit no click, so count them here (ignoring the
// counter / action menu). onCardClick swallows any trailing click; onMouseUp
// clears the flag in case none arrives.
onLongPress(
  card,
  (e) => {
    if (!isMobile.value || e.target.closest('.btn-counter, .action-menu')) return
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
  <!-- `.zekr-card` is the selector useZekrScroll walks to find the next zekr,
       and `.action-menu` / `.btn-counter` are what the long-press handler above
       excludes — keep all three class names. -->
  <div
    ref="card"
    class="zekr-card relative rounded-xl border p-4 max-lg:cursor-pointer max-lg:select-none"
    @click="onCardClick"
  >
    <div class="action-menu absolute end-2 bottom-2" @click.stop>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon-sm" type="button" class="text-muted-foreground" aria-label="خيارات الذكر">
            <IconHeartShare class="size-[1.125rem]" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="exportAsImage">
            <IconDownload />
            <span>تنزيل</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="shareZekr">
            <IconShare3 />
            <span>مشاركة</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="copyZekr">
            <IconCopy />
            <span>نسخ</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem :disabled="count === 0" @click="reset">
            <IconRestore />
            <span>تصفير</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex flex-col-reverse items-center gap-4 text-center lg:flex-row lg:text-start">
      <!-- rem (not px) so the progress circle scales with the font and the
           counter text (e.g. "100/100") stays centered without overflowing. -->
      <button
        class="btn-counter grid size-30 shrink-0 cursor-pointer place-items-center rounded-full text-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        type="button"
        @click.stop="increment"
        :style="{ '--progress': count / repeat }"
      >
        {{ toArabicNumerals(`${count}/${repeat}`) }}
      </button>

      <div class="w-full min-w-0 lg:flex-1">
        <p class="font-quran text-[1.625rem] leading-[2] text-justify">{{ text }}</p>

        <p class="pe-2 text-sm text-muted-foreground" v-if="benefit || reference">
          <span v-if="reference">{{ reference }}</span>
          <span v-if="benefit && reference"> - </span>
          <span v-if="benefit">{{ benefit }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The counter's progress ring is a conic-gradient driven by the inline
   `--progress` custom property; no Tailwind utility expresses that, so it stays
   plain CSS. Every color reads the token layer, so the user's runtime accent
   and background still apply. */
.btn-counter {
  background:
    radial-gradient(closest-side, var(--background) 79%, transparent 80% 100%),
    conic-gradient(var(--primary) calc(var(--progress) * 100%), var(--secondary) 0);
}
</style>
