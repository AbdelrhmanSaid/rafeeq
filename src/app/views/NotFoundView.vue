<script setup>
import Page from '@/layout/Page.vue'
import ErrorState from '@/shared/ui/ErrorState.vue'
</script>

<template>
  <!-- A whole-page fallback sits near the middle of the phone rather than
       clinging under the navbar — the same framing the async fallbacks use. -->
  <Page class="grid min-h-[55vh] place-items-center">
    <ErrorState code="404" message="الصفحة التي تبحث عنها غير موجودة." />
  </Page>
</template>
