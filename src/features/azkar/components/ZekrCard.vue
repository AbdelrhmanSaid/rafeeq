<script setup>
import { ref } from 'vue'
import { IconDownload, IconShare3, IconCopy, IconHeartShare, IconRestore } from '@tabler/icons-vue'
import { exportComponent } from '@/shared/utils/export'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useZekrScroll } from '@/features/azkar/composables/useZekrScroll'
import { useZekrVibration } from '@/features/azkar/composables/useZekrVibration'

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

const emit = defineEmits(['increment', 'reset'])

const count = ref(0)
const card = ref(null)
const isMobile = useIsMobile()
const { vibrateOnFinish } = useZekrVibration()
const { scrollToNextZekr } = useZekrScroll(card)

const increment = () => {
  if (count.value < props.repeat) {
    count.value++
    emit('increment')

    if (count.value === props.repeat) {
      vibrateOnFinish()
      scrollToNextZekr()
    }
  }
}

const reset = () => {
  if (count.value > 0) {
    emit('reset', count.value)
    count.value = 0
  }
}

const onCardClick = () => {
  if (isMobile.value) increment()
}

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
  <div ref="card" class="zekr-card border rounded p-4" @pointerup="onCardClick">
    <div class="action-menu dropdown" @click.stop @pointerup.stop>
      <button class="btn p-0 bg-transparent" type="button" data-bs-toggle="dropdown">
        <IconHeartShare size="18" />
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
        <li><hr class="dropdown-divider" /></li>
        <li>
          <button class="dropdown-item d-flex align-items-center gap-2" :disabled="count === 0" @click="reset">
            <IconRestore size="18" />
            <span>تصفير</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="row align-items-center g-4 text-center text-lg-start">
      <div class="col-12 col-lg-auto">
        <button
          class="btn btn-counter border-flat"
          @pointerup.stop="increment"
          :style="{ '--progress': count / repeat }"
          :data-content="toArabicNumerals(`${count}/${repeat}`)"
        ></button>
      </div>

      <div class="col-12 col-lg">
        <p class="zekr-text font-quran m-0">{{ text }}</p>

        <p class="text-muted m-0 pe-2" v-if="benefit || reference">
          <small v-if="reference">{{ reference }}</small>
          <small v-if="benefit && reference"> - </small>
          <small v-if="benefit">{{ benefit }}</small>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.zekr-card {
  position: relative;

  .btn-counter {
    position: relative;
    border-radius: 50%;
    /* rem (not px) so the progress circle scales with the font and the
       counter text (e.g. "100/100") stays centered without overflowing. */
    width: 7.5rem;
    height: 7.5rem;
    font-size: 1.25rem;
    border: none;

    background:
      radial-gradient(closest-side, var(--bs-body-bg) 79%, transparent 80% 100%),
      conic-gradient(var(--bs-primary) calc(var(--progress) * 100%), rgba(var(--bs-secondary-rgb), 0.1) 0);

    &::before {
      content: attr(data-content);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .zekr-text {
    text-align: justify;
    font-size: 1.625rem;
    line-height: 2;
  }

  .action-menu {
    position: absolute;
    inset-inline-end: 0.5rem;
    inset-block-end: 0.5rem;

    [data-bs-toggle='dropdown'] {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      color: var(--bs-secondary);
    }
  }
}

@media screen and (max-width: 992px) {
  .zekr-card {
    cursor: pointer;
    user-select: none;

    > .row {
      flex-direction: column-reverse;
    }
  }
}
</style>
