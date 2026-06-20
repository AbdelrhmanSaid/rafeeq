<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import Sebha from '@/features/sebha/Sebha.vue'
import { useMediaQuery } from '@vueuse/core'

const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<template>
  <Page :class="{ 'sebha-page': true, 'full-height': isMobile }">
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
