<script setup>
import Page from '@/layout/Page.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
</script>
<template>
  <Page class="grid min-h-[55dvh] place-items-center">
    <ErrorState code="404" message="الصفحة التي تبحث عنها غير موجودة." />
  </Page>
</template>
