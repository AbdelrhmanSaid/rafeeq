<script setup>
import { ref } from 'vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import Sebha from '@/components/Sebha.vue'
</script>

<template>
  <Page class="sebha-page full-height">
    <Heading
      class="mb-4"
      title="السبحة الإلكترونية"
      subtitle="السبحة الإلكترونية هي تطبيق يساعدك على ذكر الله في أي وقت ومكان."
      :share="true"
    />

    <Sebha />
  </Page>
</template>

<style lang="scss" scoped>
.sebha-page {
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
