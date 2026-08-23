<script setup>
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import Sebha from '@/features/sebha/components/Sebha.vue'
import { useMediaQuery } from '@vueuse/core'

const isMobile = useMediaQuery('(max-width: 768px)')
</script>
<template>
  <Page class="grid grid-rows-[auto_1fr]" :class="{ 'min-h-[calc(100vh-var(--navbar-height))]': isMobile }">
    <Heading
      title="السبحة الإلكترونية"
      subtitle="السبحة الإلكترونية هي تطبيق يساعدك على ذكر الله في أي وقت ومكان."
      :share="true"
    />
    <Sebha />
  </Page>
</template>
