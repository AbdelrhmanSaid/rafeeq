<script setup>
defineProps({
  // Label → value, in the order to list them.
  values: { type: Object, required: true },
})
</script>

<template>
  <dl class="qibla-debug" dir="ltr">
    <template v-for="(value, label) in values" :key="label">
      <dt>{{ label }}</dt>
      <dd>{{ value }}</dd>
    </template>
  </dl>
</template>

<style lang="scss" scoped>
.qibla-debug {
  position: fixed;
  inset: calc(0.5rem + env(safe-area-inset-top)) 0.5rem auto 0.5rem;
  z-index: 1080;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0 0.75rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: var(--bs-border-radius);
  background: rgb(0 0 0 / 80%);
  color: #fff;
  font:
    0.6875rem/1.5 ui-monospace,
    monospace;
  text-align: left;
  pointer-events: none;

  dt {
    font-weight: 400;
    opacity: 0.7;
  }

  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
}
</style>
