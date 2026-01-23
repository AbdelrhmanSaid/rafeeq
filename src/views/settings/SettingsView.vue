<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'

import SettingsLocation from './partials/SettingsLocation.vue'
import SettingsReciter from './partials/SettingsReciter.vue'
import SettingsNotifications from './partials/SettingsNotifications.vue'
import SettingsDownloadAssets from './partials/SettingsDownloadAssets.vue'
import SettingsAppearance from './partials/SettingsAppearance.vue'
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

    <div class="row g-3">
      <div class="col-12 col-md-6">
        <SettingsLocation />
      </div>
      <div class="col-12 col-md-6">
        <SettingsReciter />
      </div>
      <div class="col-12 col-md-6">
        <SettingsAppearance />
      </div>
      <div class="col-12 col-md-6">
        <SettingsNotifications />
      </div>
      <div class="col-12">
        <SettingsDownloadAssets />
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped></style>
