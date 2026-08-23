<script setup>
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { IconPlayerPlay, IconBook2, IconCopy, IconShare3, IconBookmark, IconBookmarkOff } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'

const props = defineProps({
  ayah: { type: Object, default: null },
  surahName: { type: String, default: '' },
  online: { type: Boolean, default: true },
  bookmarked: { type: Boolean, default: false },
})

const emit = defineEmits(['recite', 'tafseer', 'bookmark', 'close'])

// The full-width row style every action in this sheet shares. `min-h-14` (not
// padding) sets the target height, so a 130% font scale grows the row instead of
// clipping it.
const itemClass =
  'flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-start transition-colors hover:bg-accent/60 active:bg-accent'

// Each action gets a muted icon chip, so the labels line up in one column.
const iconClass = 'grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground'

const title = computed(() => (props.ayah ? `${props.surahName} ${toArabicNumerals(props.ayah.numberInSurah)}` : ''))
const shareText = computed(() => (props.ayah ? `${props.ayah.text}\n[${title.value}]` : ''))

const emitAndClose = (event) => {
  emit(event)
  emit('close')
}

const copy = () => {
  const text = shareText.value
  emit('close')
  toast.promise(() => navigator.clipboard.writeText(text), {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الآية بنجاح',
    error: 'حدث خطأ أثناء نسخ الآية',
  })
}

const share = () => {
  const text = shareText.value
  emit('close')
  const canShare = !!navigator.share
  toast.promise(() => (canShare ? navigator.share({ title: 'رفيق', text }) : navigator.clipboard.writeText(text)), {
    loading: 'جاري المشاركة...',
    success: canShare ? 'تم مشاركة الآية بنجاح' : 'تعذرت المشاركة، تم نسخ الآية بدلاً من ذلك',
    error: 'حدث خطأ أثناء مشاركة الآية',
  })
}
</script>

<template>
  <BottomSheet :show="!!ayah" :title="title" @close="emit('close')">
    <ul class="px-2 pb-4">
      <li v-if="online">
        <button :class="itemClass" @click="emitAndClose('recite')">
          <span :class="iconClass"><IconPlayerPlay class="size-5" /></span>
          <span>تلاوة</span>
        </button>
      </li>
      <li>
        <button :class="itemClass" @click="emitAndClose('tafseer')">
          <span :class="iconClass"><IconBook2 class="size-5" /></span>
          <span>تفسير</span>
        </button>
      </li>
      <li>
        <button :class="itemClass" @click="emitAndClose('bookmark')">
          <!-- The chip picks up the accent once this ayah is the saved place. -->
          <span :class="cn(iconClass, bookmarked && 'bg-primary/15 text-primary')">
            <component :is="bookmarked ? IconBookmarkOff : IconBookmark" class="size-5" />
          </span>
          <span>{{ bookmarked ? 'إزالة الإشارة المرجعية' : 'تعيين كإشارة مرجعية' }}</span>
        </button>
      </li>
      <li><Separator class="my-2" /></li>
      <li>
        <button :class="itemClass" @click="copy">
          <span :class="iconClass"><IconCopy class="size-5" /></span>
          <span>نسخ</span>
        </button>
      </li>
      <li>
        <button :class="itemClass" @click="share">
          <span :class="iconClass"><IconShare3 class="size-5" /></span>
          <span>مشاركة</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>
