<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'

import SettingsLocation from './partials/SettingsLocation.vue'
import SettingsReciter from './partials/SettingsReciter.vue'
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

    <div class="row">
      <div class="col-12 col-md-6">
        <SettingsLocation />
      </div>
      <div class="col-12 col-md-6">
        <SettingsReciter />
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped></style>
