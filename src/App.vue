<script setup lang="ts">
import LayoutNavigation from '@/components/layout/LayoutNavigation.vue'
</script>

<template>
  <main>
    <section class="pb-[6.25rem] pt-5 px-5">
      <RouterView />
    </section>

    <LayoutNavigation />
  </main>
</template>
