<template>
  <main class="container page-container">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
.page-container {
  /* The app bar above already gives the page its top breathing room. */
  padding-block: 0.25rem 2rem;
  animation: page-enter 0.35s var(--app-ease) both;
}

@media (min-width: 768px) {
  .page-container {
    padding-block: 2.5rem 3.5rem;
  }
}
</style>
