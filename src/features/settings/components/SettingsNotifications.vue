<script setup>
import { IconBell } from '@tabler/icons-vue'
import { usePushNotifications } from '@/features/settings/composables/usePushNotifications'
import SettingsSection from './SettingsSection.vue'

const { enabled, loading, state, toggle } = usePushNotifications()
</script>

<template>
  <SettingsSection title="إشعارات التطبيق" description="تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز.">
    <template #actions>
      <span class="chip chip-muted">{{ state }}</span>
    </template>

    <button
      type="button"
      class="btn btn-sm d-inline-flex align-items-center gap-2 notifications-toggle"
      :class="enabled ? 'btn-flat text-danger' : 'btn-soft'"
      :disabled="loading"
      @click="toggle"
    >
      <IconBell size="18" />
      <span>{{ enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </button>
  </SettingsSection>
</template>

<style scoped>
.notifications-toggle {
  min-height: 2.75rem;
}
</style>
