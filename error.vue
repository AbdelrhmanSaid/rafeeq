<script setup>
defineProps({
  error: Object
})

useSeoMeta({
  title: '404 - الصفحة غير موجودة - رفيق',
})
</script>

<template>
  <NuxtLayout>
    <Page>
      <ErrorState :code="error?.statusCode || 404" message="الصفحة التي تبحث عنها غير موجودة." />
    </Page>
  </NuxtLayout>
</template>

