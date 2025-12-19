<script setup>
useSeoMeta({
  title: 'الإعدادات - رفيق',
  ogTitle: 'الإعدادات - رفيق',
  description: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
  ogDescription: 'تخصيص إعدادات تطبيق رفيق بما يناسب احتياجاتك وتفضيلاتك.',
  keywords: 'إعدادات, تخصيص, خيارات',
})
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
      <div class="col-12">
        <SettingsNotifications />
      </div>
      <div class="col-12">
        <SettingsDownloadAssets />
      </div>
    </div>
  </Page>
</template>

