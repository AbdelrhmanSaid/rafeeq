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
       excludes — keep all three class names.

       The whole card is the tap target below `lg` (that is the viewport
       `useIsMobile` reports on), so the pointer/selection affordances are the
       phone default and get switched off from `lg` up, where only the counter
       counts. -->
  <div
    ref="card"
    class="zekr-card cursor-pointer rounded-2xl bg-card p-5 text-card-foreground shadow-sm select-none lg:cursor-auto lg:p-6 lg:select-auto"
    @click="onCardClick"
  >
    <!-- Rare actions sit at the top end of the card, clear of the thumb zone
         and clear of the text; the negative margins pull the 2.75rem target
         back into the card's corner so it costs almost no height. -->
    <div class="action-menu -mt-2 -me-2 flex justify-end" @click.stop>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            class="size-11 rounded-full text-muted-foreground active:scale-90"
            aria-label="خيارات الذكر"
          >
            <IconHeartShare class="size-5" />
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

          <DropdownMenuSeparator />

          <DropdownMenuItem class="min-h-11 gap-3 rounded-xl px-3 text-sm" :disabled="count === 0" @click="reset">
            <IconRestore class="size-5" />
            <span>تصفير</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- One zekr, one column on a phone: the text leads and the counter sits
         under it, in reach of the thumb. From `lg` the row reverses so the
         counter returns to the start edge beside the text. -->
    <div class="flex flex-col items-center gap-5 lg:flex-row-reverse lg:items-center lg:gap-8">
      <div class="w-full min-w-0 text-center lg:flex-1 lg:text-start">
        <p class="font-quran text-2xl leading-[2.15] text-pretty sm:text-[1.625rem]">{{ text }}</p>

        <p class="mt-3 text-sm leading-relaxed text-muted-foreground" v-if="benefit || reference">
          <span v-if="reference">{{ reference }}</span>
          <span v-if="benefit && reference"> - </span>
          <span v-if="benefit">{{ benefit }}</span>
        </p>
      </div>

      <!-- rem (not px) so the progress ring scales with the font and the
           counter text (e.g. "100/100") stays centered without overflowing. -->
      <button
        class="btn-counter grid size-30 shrink-0 cursor-pointer place-items-center rounded-full text-xl font-medium text-primary tabular-nums transition outline-none select-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
        type="button"
        @click.stop="increment"
        :style="{ '--progress': count / repeat }"
      >
        {{ toArabicNumerals(`${count}/${repeat}`) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* The counter's progress ring is a conic-gradient driven by the inline
   `--progress` custom property; no Tailwind utility expresses that, so it stays
   plain CSS. Every color reads the token layer, so the user's runtime accent
   and background still apply — the disc punched out of the middle is `--card`
   because the counter sits on a card, which leaves a floating ring around the
   number. */
.btn-counter {
  background:
    radial-gradient(closest-side, var(--card) 80%, transparent 81% 100%),
    conic-gradient(var(--primary) calc(var(--progress) * 100%), color-mix(in oklab, var(--primary) 15%, transparent) 0);
}
</style>
