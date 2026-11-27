<script setup>
import { computed, ref } from 'vue'
import { onLongPress } from '@vueuse/core'
import { IconDownload, IconShare3, IconCopy, IconRestore } from '@tabler/icons-vue'
import { exportComponent } from '@/shared/utils/export'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useZekrScroll } from '@/features/azkar/composables/useZekrScroll'
import { useZekrVibration } from '@/features/azkar/composables/useZekrVibration'

import BottomSheet from '@/shared/ui/BottomSheet.vue'
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

const repeatLabel = computed(() => {
  const n = props.repeat
  if (n === 1) return 'مرة واحدة'
  if (n === 2) return 'مرتان'
  const lastTwo = n % 100
  return `${toArabicNumerals(n)} ${lastTwo >= 3 && lastTwo <= 10 ? 'مرات' : 'مرة'}`
})
const card = ref(null)
const showActions = ref(false)
const isMobile = useIsMobile()
const { vibrateOnFinish } = useZekrVibration()
const { scrollToNextZekr } = useZekrScroll(card)

const increment = () => {
  if (count.value >= props.repeat) return

  // A model read immediately after writing can still be stale.
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
let touchMoved = false
let touchStartY = null

const onTouchStart = (e) => {
  touchStartY = e.touches?.[0]?.clientY ?? null
}

const onTouchEnd = (e) => {
  const endY = e.changedTouches?.[0]?.clientY
  touchMoved = touchStartY != null && endY != null && Math.abs(endY - touchStartY) > 12
  touchStartY = null
}

// A long press flags the click that follows so it doesn't count twice. Clear it on every new press: iOS sometimes
// skips pointer-up, and a stale flag would swallow the next tap.
const onPressStart = () => {
  longPressed = false
}

// Action clicks don't count but must still bubble: Bootstrap closes the open dropdown on a document click.
const onCardClick = (e) => {
  if (e.target.closest?.('.card-actions')) return
  if (!longPressed && !touchMoved) increment()
  longPressed = false
  touchMoved = false
}

// Mobile long presses may not emit a click, so count them separately.
onLongPress(
  card,
  (e) => {
    if (!isMobile.value || e.target.closest('.btn-counter, .card-actions')) return
    longPressed = true
    increment()
  },
  { distanceThreshold: 10, onMouseUp: () => setTimeout(() => (longPressed = false), 100) },
)

const exportAsImage = () => {
  showActions.value = false
  toast.promise(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return exportComponent(ZekrImage, props, 'zekr', { expectedWidth: 512 })
    },
    {
      loading: 'جاري التصدير...',
      success: 'تم تصدير الصورة بنجاح',
      error: 'حدث خطأ أثناء تصدير الصورة',
    },
  )
}

// Closing the share sheet without sharing isn't an error.
const shareZekr = async () => {
  if (!navigator.share) return copyZekr()

  showActions.value = false
  try {
    await navigator.share({ title: 'رفيق', text: props.text })
    toast.success('تم مشاركة الذكر بنجاح')
  } catch (e) {
    if (e?.name !== 'AbortError') toast.error('حدث خطأ أثناء مشاركة الذكر')
  }
}

function copyZekr() {
  showActions.value = false
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
    class="card zekr-card-root"
    :class="{ completed: count >= repeat }"
    @click="onCardClick"
    @pointerdown="onPressStart"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="zekr-body">
      <p class="zekr-text font-quran">{{ text }}</p>

      <p v-if="benefit || reference" class="zekr-note">
        <span v-if="reference">{{ reference }}</span>
        <span v-if="benefit && reference"> - </span>
        <span v-if="benefit">{{ benefit }}</span>
      </p>
    </div>

    <div class="zekr-footer" :style="{ '--progress': count / repeat }">
      <button class="btn-counter" type="button" aria-label="تسجيل تكرار الذكر" @click.stop="increment">
        {{ toArabicNumerals(`${count} / ${repeat}`) }}
      </button>
      <span class="zekr-footer__repeat">{{ repeatLabel }}</span>
      <span class="visually-hidden" role="status">{{ toArabicNumerals(count) }} من {{ toArabicNumerals(repeat) }}</span>

      <div class="card-actions">
        <button type="button" aria-label="تصفير" :disabled="count === 0" @click="reset">
          <IconRestore size="18" />
        </button>

        <button
          v-if="isMobile"
          type="button"
          aria-label="خيارات الذكر"
          aria-haspopup="dialog"
          :aria-expanded="showActions"
          @click="showActions = true"
        >
          <IconShare3 size="18" />
        </button>

        <div v-else class="dropdown">
          <button type="button" data-bs-toggle="dropdown" aria-label="خيارات الذكر">
            <IconShare3 size="18" />
          </button>

          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item d-flex align-items-center gap-2" @click="exportAsImage">
                <IconDownload size="18" />
                <span>تنزيل</span>
              </button>
            </li>
            <li>
              <button class="dropdown-item d-flex align-items-center gap-2" @click="shareZekr">
                <IconShare3 size="18" />
                <span>مشاركة</span>
              </button>
            </li>
            <li>
              <button class="dropdown-item d-flex align-items-center gap-2" @click="copyZekr">
                <IconCopy size="18" />
                <span>نسخ</span>
              </button>
            </li>
          </ul>
        </div>

        <BottomSheet :show="showActions" title="خيارات الذكر" @close="showActions = false">
          <ul class="bottom-sheet-list">
            <li>
              <button type="button" class="bottom-sheet-item" @click="exportAsImage">
                <IconDownload size="20" />
                <span>تنزيل كصورة</span>
              </button>
            </li>
            <li>
              <button type="button" class="bottom-sheet-item" @click="shareZekr">
                <IconShare3 size="20" />
                <span>مشاركة</span>
              </button>
            </li>
            <li>
              <button type="button" class="bottom-sheet-item" @click="copyZekr">
                <IconCopy size="20" />
                <span>نسخ</span>
              </button>
            </li>
          </ul>
        </BottomSheet>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Card opacity would trap its dropdown in a lower stacking context, so only the text dims when done. */
.completed {
  background-color: color-mix(in srgb, var(--bs-primary) 4%, var(--app-surface));

  .zekr-text,
  .zekr-note {
    opacity: 0.6;
  }

  .zekr-footer::before {
    background: color-mix(in srgb, var(--bs-primary) 30%, var(--app-surface));
  }
}

.zekr-body {
  padding: 1.25rem 1.25rem 1rem;
  container-type: inline-size;
}

/* Justify only when a line fits ~10 words; narrow cards or large text would get gaping word spaces. */
.zekr-text {
  margin: 0;
  font-size: 1.625rem;
  line-height: 2;
  text-align: start;

  @container (min-width: 17em) {
    text-align: justify;
  }
}

.zekr-note {
  margin: 0.5rem 0 0;
  color: var(--bs-secondary-color);
  font-size: 0.8125rem;
  line-height: 1.7;
}

.zekr-footer {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-block: 0.375rem;
  padding-inline: 0.75rem 0.375rem;
  border-top: 1px solid var(--app-hairline);

  &::before {
    content: '';
    position: absolute;
    inset-block-start: -1px;
    inset-inline-start: 0;
    width: calc(var(--progress) * 100%);
    height: 3px;
    background: var(--bs-primary);
    transition: width 0.2s var(--app-ease);
  }
}

.btn-counter {
  min-width: 4rem;
  padding: 0.25rem 0.75rem;
  border: 0;
  border-radius: 999px;
  background: var(--bs-primary);
  color: var(--app-on-primary);
  font-size: 0.9375rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  &:active {
    opacity: 0.85;
  }
}

.zekr-footer__repeat {
  min-width: 0;
  overflow: hidden;
  color: var(--bs-secondary-color);
  font-size: 0.8125rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  align-items: center;
  margin-inline-start: auto;

  > button,
  [data-bs-toggle='dropdown'] {
    display: grid;
    place-items: center;
    /* A 44px target with a fixed-size icon; growing it with the text would push the repeat label off a narrow card. */
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--bs-secondary-color);

    @media (hover: hover) and (pointer: fine) {
      &:hover:not(:disabled) {
        background-color: var(--app-tint);
        color: var(--app-primary-ink);
      }
    }

    &:disabled {
      opacity: 0.35;
    }
  }
}

.zekr-card-root {
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}
</style>
