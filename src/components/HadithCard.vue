<script setup>
import { IconDownload, IconShare3, IconCopy, IconHeartShare } from '@tabler/icons-vue'
import { exportComponent } from '@/utilities/export'
import { toast } from 'vue-sonner'

import HadithImage from './HadithImage.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})

const exportAsImage = () => {
  let promise = () =>
    new Promise(async (resolve, reject) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      exportComponent(HadithImage, props, 'hadith').then(resolve).catch(reject)
    })

  toast.promise(promise, {
    loading: 'جاري التصدير...',
    success: 'تم تصدير الصورة بنجاح',
    error: 'حدث خطأ أثناء تصدير الصورة',
  })
}

const shareHadith = async () => {
  let promise = () =>
    new Promise((resolve, reject) => {
      navigator.share({ title: 'رفيق', text: props.text }).then(resolve).catch(reject)
    })

  toast.promise(promise, {
    loading: 'جاري المشاركة...',
    success: 'تم مشاركة الحديث بنجاح',
    error: 'حدث خطأ أثناء مشاركة الحديث',
  })
}

const copyHadith = async () => {
  let promise = () =>
    new Promise((resolve, reject) => {
      navigator.clipboard.writeText(props.text).then(resolve).catch(reject)
    })

  toast.promise(promise, {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الحديث بنجاح',
    error: 'حدث خطأ أثناء نسخ الحديث',
  })
}
</script>

<template>
  <div class="hadith-card border rounded p-4">
    <div class="action-menu dropdown" @click.stop>
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
          <button class="dropdown-item d-flex align-items-center gap-2" @click="shareHadith">
            <IconShare3 size="18" />
            <span>مشاركة</span>
          </button>
        </li>
        <li>
          <button class="dropdown-item d-flex align-items-center gap-2" @click="copyHadith">
            <IconCopy size="18" />
            <span>نسخ</span>
          </button>
        </li>
      </ul>
    </div>

    <p class="hadith-text font-quran m-0">{{ text }}</p>
  </div>
</template>

<style lang="scss" scoped>
.hadith-card {
  position: relative;

  .hadith-text {
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
</style>
