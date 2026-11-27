<script setup>
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { IconPlayerPlay, IconBook2, IconCopy, IconShare3, IconBookmarkOff, IconCheck } from '@tabler/icons-vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { BOOKMARK_COLORS } from '@/features/quran/composables/useQuranBookmarks'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

const props = defineProps({
  // { key, surah, ayah, text } of the selected ayah.
  ayah: { type: Object, default: null },
  surahName: { type: String, default: '' },
  online: { type: Boolean, default: true },
  bookmarkColor: { type: String, default: null },
})

const emit = defineEmits(['recite', 'tafseer', 'bookmark', 'unbookmark', 'close'])

const title = computed(() => (props.ayah ? `${props.surahName} ${toArabicNumerals(props.ayah.ayah)}` : ''))
const shareText = computed(() => (props.ayah ? `${props.ayah.text}\n[${title.value}]` : ''))

const emitAndClose = (event, value) => {
  emit(event, value)
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

// The system share sheet says for itself whether it worked; closing it without sharing isn't an error.
const share = async () => {
  const text = shareText.value
  emit('close')
  if (!navigator.share) {
    toast.promise(() => navigator.clipboard.writeText(text), {
      success: 'تم نسخ الآية للمشاركة',
      error: 'حدث خطأ أثناء مشاركة الآية',
    })
    return
  }
  try {
    await navigator.share({ title: 'رفيق', text })
  } catch (error) {
    if (error?.name !== 'AbortError') toast.error('حدث خطأ أثناء مشاركة الآية')
  }
}
</script>

<template>
  <BottomSheet :show="!!ayah" :title="title" @close="emit('close')">
    <!-- Bookmarking is a color: the ayah is tinted with it on the page. -->
    <div class="bookmark-colors" role="radiogroup" aria-label="لون الإشارة المرجعية">
      <span class="bookmark-colors__label">إشارة مرجعية</span>
      <div class="bookmark-colors__dots">
        <button
          v-for="color in BOOKMARK_COLORS"
          :key="color.id"
          type="button"
          role="radio"
          class="bookmark-dot"
          :class="`mark-${color.id}`"
          :aria-checked="bookmarkColor === color.id"
          :aria-label="color.label"
          @click="emitAndClose('bookmark', color.id)"
        >
          <IconCheck v-if="bookmarkColor === color.id" size="16" stroke-width="3" aria-hidden="true" />
        </button>
      </div>
    </div>

    <ul class="bottom-sheet-list">
      <li v-if="bookmarkColor">
        <button type="button" class="bottom-sheet-item" @click="emitAndClose('unbookmark')">
          <IconBookmarkOff size="20" />
          <span>إزالة الإشارة المرجعية</span>
        </button>
      </li>
      <li v-if="online">
        <button type="button" class="bottom-sheet-item" @click="emitAndClose('recite')">
          <IconPlayerPlay size="20" />
          <span>تلاوة من هنا</span>
        </button>
      </li>
      <li>
        <button type="button" class="bottom-sheet-item" @click="emitAndClose('tafseer')">
          <IconBook2 size="20" />
          <span>تفسير</span>
        </button>
      </li>
      <li role="separator" class="bottom-sheet-separator"></li>
      <li>
        <button type="button" class="bottom-sheet-item" @click="copy">
          <IconCopy size="20" />
          <span>نسخ</span>
        </button>
      </li>
      <li>
        <button type="button" class="bottom-sheet-item" @click="share">
          <IconShare3 size="20" />
          <span>مشاركة</span>
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>

<style lang="scss" scoped>
.bookmark-colors {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.25rem 1.25rem 0.5rem;
}

.bookmark-colors__label {
  flex-shrink: 0;
  font-weight: 500;
  white-space: nowrap;
}

.bookmark-colors__dots {
  display: flex;
  min-width: 0;
}

/* A 44px target around a 28px swatch. */
.bookmark-dot {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;

  &::before {
    content: '';
    position: absolute;
    inset: 0.5rem;
    border-radius: 50%;
    background: var(--mark-solid);
    transition: transform 0.15s var(--app-ease-out);
  }

  svg {
    position: relative;
  }

  &:active::before {
    transform: scale(0.88);
  }

  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: -2px;
    border-radius: 50%;
  }
}
</style>
