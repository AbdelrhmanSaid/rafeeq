<script setup>
import { ref, defineProps } from 'vue'
import { toArabicNumber } from '@/utilities/arabic'

defineProps(['text', 'repeat'])

const count = ref(0)
</script>

<template>
  <div class="zekr-card border rounded p-4">
    <div class="row align-items-center g-4 text-center text-lg-start">
      <div class="col-12 col-lg-auto">
        <button
          class="btn btn-counter border-flat"
          @click="count < repeat && count++"
          :style="{ '--progress': count / repeat }"
          :data-content="`${toArabicNumber(count)} / ${toArabicNumber(repeat)}`"
        ></button>
      </div>

      <div class="col-12 col-lg">
        <p class="zekr-text font-quran m-0">{{ text }}</p>
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

    background: radial-gradient(closest-side, var(--bs-body-bg) 79%, transparent 80% 100%),
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
    font-size: 1.5rem;
    line-height: 2;
  }
}
</style>
