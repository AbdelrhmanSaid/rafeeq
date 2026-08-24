<script setup>
import { IconCheck } from '@tabler/icons-vue'

defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  result: { type: Object, required: true }, // { value, hint }
  conditionsTitle: { type: String, required: true },
  conditions: { type: Array, required: true },
})
</script>

<template>
  <div class="zakat-card card">
    <div class="card-body">
      <header class="zakat-card__header">
        <span class="icon-tile zakat-card__icon"><component :is="icon" :size="20" /></span>
        <div>
          <h3 class="zakat-card__title">{{ title }}</h3>
          <p v-if="description" class="zakat-card__description">{{ description }}</p>
        </div>
      </header>

      <div class="zakat-card__grid">
        <div class="zakat-card__form">
          <slot />
        </div>

        <div class="zakat-result">
          <span class="zakat-result__label">مقدار الزكاة الواجبة</span>
          <span class="zakat-result__value">{{ result.value }}</span>
          <span class="zakat-result__hint">{{ result.hint }}</span>
        </div>
      </div>
    </div>

    <div class="zakat-conditions card-footer">
      <h4 class="zakat-conditions__title">{{ conditionsTitle }}</h4>
      <ul class="zakat-conditions__list">
        <li v-for="(condition, index) in conditions" :key="index">
          <span class="zakat-conditions__check"><IconCheck :size="13" /></span>
          <span>{{ condition }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.zakat-card {
  overflow: hidden;
}

.zakat-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.zakat-card__icon {
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .zakat-card__icon {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}

.zakat-card__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.zakat-card__description {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: var(--bs-secondary-color);
}

.zakat-card__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
  align-items: stretch;

  @media (min-width: 992px) {
    grid-template-columns: minmax(0, 1.4fr) minmax(16rem, 1fr);
  }
}

.zakat-card__form {
  min-width: 0;

  :deep(.form-label) {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
  }

  :deep(.form-control) {
    font-variant-numeric: tabular-nums;
  }

  :deep(.form-text) {
    display: inline-flex;
    margin-top: 0.5rem;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    background: var(--app-tint);
    color: var(--bs-primary);
    font-size: 0.78rem;
    font-weight: 600;
  }
}

[data-bs-theme='dark'] .zakat-card__form :deep(.form-text) {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

/* Result panel — a quiet tinted surface; the number carries the weight. */
.zakat-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.5rem 1.25rem;
  border: 1px solid var(--app-hairline-strong);
  border-radius: var(--bs-border-radius-lg);
  background: color-mix(in srgb, var(--bs-primary) 6%, var(--app-surface));
  text-align: center;
}

.zakat-result__label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--bs-secondary-color);
}

.zakat-result__value {
  font-size: clamp(1.6rem, 4vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--bs-primary);
  font-variant-numeric: tabular-nums;
}

[data-bs-theme='dark'] .zakat-result__value {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.zakat-result__hint {
  margin-top: 0.25rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: var(--app-tint);
  color: var(--bs-primary);
  font-size: 0.75rem;
  font-weight: 600;
}

[data-bs-theme='dark'] .zakat-result__hint {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.zakat-conditions {
  padding: 1.1rem 1.25rem 1.25rem;
}

.zakat-conditions__title {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.zakat-conditions__list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.875rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 1.5rem;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
  }
}

.zakat-conditions__check {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.15rem;
  border-radius: 50%;
  background: var(--app-tint);
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .zakat-conditions__check {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}
</style>
