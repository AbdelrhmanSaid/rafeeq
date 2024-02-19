<script setup>
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import NavigationMenu from '@/components/NavigationMenu.vue';
</script>

<template>
  <main>
    <AppHeader />

    <section>
      <RouterView />
    </section>

    <NavigationMenu />
  </main>
</template>

<style lang="scss" scoped>
main {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  section {
    flex: 1;
    margin: 0;
    overflow-y: auto;
  }
}
</style>
