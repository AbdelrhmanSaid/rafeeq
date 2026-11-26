<template>
  <main class="container page-container">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
.page-container {
  /* The app bar above already gives the page its top breathing room. */
  padding-block: 0.25rem 2rem;
  animation: page-enter 0.2s ease-out both;
}

@media (min-width: 768px) {
  .page-container {
    padding-block: 0.5rem 3.5rem;
  }
}

/* Desktop: no app bar above, so the page brings its own space under the top nav. */
@media (min-width: 992px) {
  .page-container {
    padding-top: 1.5rem;
  }
}
</style>
