<script setup>
import PageLayout from '@/components/Layout/PageLayout.vue'
import ErrorState from '@/components/ErrorState.vue'
</script>

<template>
  <PageLayout>
    <ErrorState code="404" message="الصفحة التي تبحث عنها غير موجودة." />
  </PageLayout>
</template>
