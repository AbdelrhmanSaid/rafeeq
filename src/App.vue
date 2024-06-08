<script setup>
import { RouterView } from 'vue-router'
import LayoutNavbar from '@/components/Layout/LayoutNavbar.vue'
import LayoutFooter from '@/components/Layout/LayoutFooter.vue'
</script>

<template>
  <LayoutNavbar />
  <RouterView />
  <LayoutFooter />
</template>
