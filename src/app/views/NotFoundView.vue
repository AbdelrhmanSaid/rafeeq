<script setup>
import { useRouter } from 'vue-router'
import { IconMapOff } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import StatePanel from '@/shared/ui/StatePanel.vue'

const router = useRouter()
</script>

<template>
  <Page class="full-height not-found">
    <StatePanel :icon="IconMapOff" title="الصفحة غير موجودة" message="الصفحة التي تبحث عنها غير موجودة أو تم نقلها.">
      <button type="button" class="btn btn-soft" @click="router.push({ name: 'home' })">العودة للرئيسية</button>
    </StatePanel>
  </Page>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
}
</style>
