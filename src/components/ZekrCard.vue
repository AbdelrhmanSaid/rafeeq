<script setup>
import { ref } from 'vue'
import { IconDownload, IconShare3, IconCopy, IconHeartShare } from '@tabler/icons-vue'
import { exportComponent } from '@/utilities/export'
import { toast } from 'vue-sonner'

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

const count = ref(0)

const exportAsImage = () => {
  let promise = () =>
    new Promise(async (resolve, reject) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      exportComponent(ZekrImage, props, 'zekr').then(resolve).catch(reject)
    })

  toast.promise(promise, {
    loading: 'جاري التصدير...',
    success: 'تم تصدير الصورة بنجاح',
    error: 'حدث خطأ أثناء تصدير الصورة',
  })
}

const shareZekr = async () => {
  let promise = () =>
    new Promise((resolve, reject) => {
      navigator.share({ title: 'رفيق', text: props.text }).then(resolve).catch(reject)
    })

  toast.promise(promise, {
    loading: 'جاري المشاركة...',
    success: 'تم مشاركة الذكر بنجاح',
    error: 'حدث خطأ أثناء مشاركة الذكر',
  })
}

const copyZekr = async () => {
  let promise = () =>
    new Promise((resolve, reject) => {
      navigator.clipboard.writeText(props.text).then(resolve).catch(reject)
    })

  toast.promise(promise, {
    loading: 'جاري النسخ...',
    success: 'تم نسخ الذكر بنجاح',
    error: 'حدث خطأ أثناء نسخ الذكر',
  })
}
</script>

<template>
  <div class="zekr-card border rounded p-4">
    <div class="action-menu dropdown">
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
      </ul>
    </div>

    <div class="row align-items-center g-4 text-center text-lg-start">
      <div class="col-12 col-lg-auto">
        <button
          class="btn btn-counter border-flat"
          @click="count < repeat && count++"
          :style="{ '--progress': count / repeat }"
          :data-content="`${count}/${repeat}`"
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
[data-bs-theme='dark'] .zekr-card {
  --bs-primary-bg-subtle: rgba(255, 255, 255, 0.1);
}

.zekr-card {
  position: relative;

  .btn-counter {
    position: relative;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    font-size: 1.25rem;
    border: none;

    background:
      radial-gradient(closest-side, var(--bs-body-bg) 79%, transparent 80% 100%),
      conic-gradient(var(--bs-primary) calc(var(--progress) * 100%), var(--bs-primary-bg-subtle) 0);

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
  .zekr-card > .row {
    flex-direction: column-reverse;
  }
}
</style>
