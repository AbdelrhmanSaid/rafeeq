<template>
  <main class="container page-container">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
.page-container {
  padding-block: 0.25rem 2rem;
  animation: page-enter 0.2s ease-out both;
}

@media (min-width: 768px) {
  .page-container {
    max-width: 40rem;
    padding-block: 0.5rem 3.5rem;
  }
}

@media (min-width: 992px) {
  .page-container {
    padding-top: 1.5rem;
  }
}
</style>
