<script setup>
defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  result: { type: Object, required: true }, // { value, hint }
  conditionsTitle: { type: String, required: true },
  conditions: { type: Array, required: true },
})
</script>

<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-center gap-3 mb-4">
        <span class="icon-container"><component :is="icon" /></span>
        <h5 class="card-title mb-0">{{ title }}</h5>
      </div>

      <div class="row g-4">
        <div class="col-lg-7">
          <slot />
        </div>

        <div class="col-lg-5">
          <div class="zakat-result h-100">
            <span class="zakat-result-label">مقدار الزكاة</span>
            <span class="zakat-result-value">{{ result.value }}</span>
            <span class="zakat-result-hint">{{ result.hint }}</span>
          </div>
        </div>
      </div>

      <div class="zakat-note mt-4">
        <h6 class="mb-2">{{ conditionsTitle }}</h6>
        <ul class="mb-0">
          <li v-for="(condition, index) in conditions" :key="index">{{ condition }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon-container {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--bs-border-color);
  color: var(--bs-primary);

  :deep(svg) {
    width: 24px;
    height: 24px;
  }
}

.zakat-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  text-align: center;
  padding: 1.5rem;
  border-radius: var(--bs-border-radius-lg);
  border: 1px solid var(--bs-primary);
}

.zakat-result-label {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
}

.zakat-result-value {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--bs-body-color);
}

.zakat-result-hint {
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}

.zakat-note {
  padding: 1rem 1.25rem;
  border-radius: var(--bs-border-radius);
  border: 1px solid var(--bs-border-color);
  font-size: 0.9rem;
}
</style>
