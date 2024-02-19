<script setup>
import { RouterLink } from 'vue-router';
import logo from '@/assets/logo.svg';
</script>

<template>
  <header>
    <RouterLink to="/">
      <img :src="logo" alt="رفيق - زادك في الطريق" />
    </RouterLink>
  </header>
</template>

<style lang="scss" scoped>
header {
  height: 80px;
  padding: 1rem;
  text-align: center;
  background-color: #fffaf5;
  border: 1px solid #ddd;

  img {
    height: 100%;
  }
}
</style>
