<script setup>
defineProps({
  result: { type: Object, required: true },
  conditions: { type: Array, required: true },
})
</script>

<template>
  <div class="zakat-calc">
    <section class="zakat-hero">
      <span class="zakat-hero__label">الزكاة الواجبة</span>
      <ul v-if="result.items?.length" class="zakat-hero__items">
        <li v-for="item in result.items" :key="item.label">
          <bdi class="zakat-hero__item-value">{{ item.value }}</bdi>
          <span class="zakat-hero__item-label">{{ item.label }}</span>
        </li>
      </ul>
      <bdi v-else class="zakat-hero__value">{{ result.value }}</bdi>
      <p class="zakat-hero__meta">
        <span>{{ result.hint }}</span>
        <span v-if="result.status" class="zakat-hero__status">
          {{ result.status === 'reached' ? 'بلغ النصاب' : 'لم يبلغ النصاب' }}
        </span>
      </p>
    </section>

    <div class="list-group zakat-calc__inputs">
      <slot />
    </div>

    <h2 class="list-title zakat-calc__title">الشروط</h2>
    <ul class="list-group zakat-calc__conditions">
      <li v-for="(condition, index) in conditions" :key="index" class="list-group-item">{{ condition }}</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.zakat-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 0.25rem;
  padding: 1.25rem 1.35rem;
  border-radius: var(--bs-border-radius-lg);
  box-shadow: var(--app-shadow-card);
  background:
    radial-gradient(28rem 14rem at 100% 0, rgba(255, 255, 255, 0.18), transparent 70%),
    linear-gradient(135deg, var(--bs-primary), color-mix(in srgb, var(--bs-primary) 72%, #000));
  color: var(--app-on-primary);

  @supports (color: rgb(from red r g b)) {
    background:
      radial-gradient(28rem 14rem at 100% 0, rgba(255, 255, 255, 0.18), transparent 70%),
      linear-gradient(
        135deg,
        var(--bs-primary),
        color-mix(
          in srgb,
          var(--bs-primary) 72%,
          rgb(from var(--app-on-primary) calc(255 - r) calc(255 - g) calc(255 - b))
        )
      );
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23fff' stroke-width='1'%3E%3Cpath d='M28 4l6.5 17.5L52 28l-17.5 6.5L28 52l-6.5-17.5L4 28l17.5-6.5z'/%3E%3Cpath d='M28 12l4 12 12 4-12 4-4 12-4-12-12-4 12-4z'/%3E%3Ccircle cx='28' cy='28' r='3'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 56px 56px;
    mask-image: linear-gradient(200deg, #000 20%, transparent 85%);
    pointer-events: none;
  }

  > * {
    position: relative;
  }
}

.zakat-hero__label {
  color: color-mix(in srgb, var(--app-on-primary) 80%, var(--bs-primary));
  font-size: 0.875rem;
}

.zakat-hero__value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.zakat-hero__items {
  display: grid;
  gap: 0.125rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 0.5rem;
  }
}

.zakat-hero__item-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.35;
}

.zakat-hero__item-label {
  color: color-mix(in srgb, var(--app-on-primary) 80%, var(--bs-primary));
  font-size: 0.875rem;
}

.zakat-hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
  color: color-mix(in srgb, var(--app-on-primary) 80%, var(--bs-primary));
  font-size: 0.8125rem;
}

.zakat-hero__status {
  padding: 0.125rem 0.625rem;
  border: 1px solid color-mix(in srgb, var(--app-on-primary) 45%, var(--bs-primary));
  border-radius: 999px;
  color: var(--app-on-primary);
}

.zakat-calc__inputs {
  margin-top: 1rem;
}

.zakat-calc__title {
  margin-top: 1.5rem;
}
</style>
