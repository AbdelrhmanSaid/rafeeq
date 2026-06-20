<script setup>
import Page from '@/layout/Page.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
</script>

<template>
  <Page>
    <ErrorState code="404" message="الصفحة التي تبحث عنها غير موجودة." />
  </Page>
</template>
