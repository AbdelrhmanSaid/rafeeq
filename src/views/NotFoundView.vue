<script setup>
import Page from '@/components/Layout/Page.vue'
import ErrorState from '@/components/ErrorState.vue'
</script>

<template>
  <Page>
    <ErrorState code="404" message="الصفحة التي تبحث عنها غير موجودة." />
  </Page>
</template>
