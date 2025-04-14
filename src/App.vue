<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Layout/Navbar.vue'
import Footer from '@/components/Layout/Footer.vue'
</script>

<template>
  <Navbar />
  <RouterView />
  <Footer />
</template>
