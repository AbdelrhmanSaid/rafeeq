<script setup>
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { IconPlayerPlay, IconBook2, IconCopy, IconShare3, IconBookmark, IconBookmarkOff } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

const props = defineProps({
  ayah: { type: Object, default: null },
  surahName: { type: String, default: '' },
  online: { type: Boolean, default: true },
  bookmarked: { type: Boolean, default: false },
})

const emit = defineEmits(['recite', 'tafseer', 'bookmark', 'close'])

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
    <ul class="list-unstyled m-0 py-2">
      <li v-if="online">
        <button class="bottom-sheet-item" @click="emitAndClose('recite')">
          <IconPlayerPlay size="20" />
          <span>تلاوة</span>
        </button>
      </li>
      <li>
        <button class="bottom-sheet-item" @click="emitAndClose('tafseer')">
          <IconBook2 size="20" />
          <span>تفسير</span>
        </button>
      </li>
      <li>
        <button class="bottom-sheet-item" @click="emitAndClose('bookmark')">
          <component :is="bookmarked ? IconBookmarkOff : IconBookmark" size="20" />
          <span>{{ bookmarked ? 'إزالة الإشارة المرجعية' : 'تعيين كإشارة مرجعية' }}</span>
        </button>
      </li>
      <li><hr class="my-2" /></li>
      <li>
        <button class="bottom-sheet-item" @click="copy">
          <IconCopy size="20" />
          <span>نسخ</span>
        </button>
      </li>
      <li>
        <button class="bottom-sheet-item" @click="share">
          <IconShare3 size="20" />
          <span>مشاركة</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>
