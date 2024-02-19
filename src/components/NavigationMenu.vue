<script setup>
import RadioIcon from '@/components/icons/RadioIcon.vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import QuranIcon from '@/components/icons/QuranIcon.vue';
</script>

<template>
  <nav>
    <RouterLink :to="{ name: 'radio' }">
      <RadioIcon />
      <span>الراديو</span>
    </RouterLink>

    <RouterLink :to="{ name: 'home' }">
      <HomeIcon />
      <span>الرئيسية</span>
    </RouterLink>

    <RouterLink :to="{ name: 'quran' }">
      <QuranIcon />
      <span>القرآن</span>
    </RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  display: flex;
  justify-content: space-around;
  align-items: center;

  height: 80px;
  padding: 1rem;
  color: #e7ded4;
  background-color: #241814;
  border-top: 1px solid #ddd;

  a {
    display: flex;
    flex-direction: column;
    align-items: center;

    color: #e7ded4;
    font-size: 0.8rem;

    &[aria-current='page'] {
      transform: scale(1.1);
      color: #f7f7f7;
    }
  }
}
</style>
