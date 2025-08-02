<script setup>
import { ref } from 'vue'
import { IconDownload } from '@tabler/icons-vue'
import { exportComponent } from '@/utilities/export'

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

const exportAsImage = () => exportComponent(ZekrImage, props, 'zekr')
</script>

<template>
  <div class="zekr-card border rounded p-4">
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

        <div class="d-flex flex-column flex-lg-row align-items-center mt-3">
          <p class="text-muted m-0" v-if="benefit || reference">
            <small v-if="reference">{{ reference }}</small>
            <small v-if="benefit && reference"> - </small>
            <small v-if="benefit">{{ benefit }}</small>
          </p>

          <!-- Download button at bottom -->
          <button class="btn btn-link text-muted p-1 ms-lg-auto" @click="exportAsImage" title="تصدير كصورة">
            <IconDownload :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
[data-bs-theme='dark'] .zekr-card {
  --bs-primary-bg-subtle: rgba(255, 255, 255, 0.1);
}

.zekr-card {
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
}

@media screen and (max-width: 992px) {
  .zekr-card > .row {
    flex-direction: column-reverse;
  }
}
</style>
