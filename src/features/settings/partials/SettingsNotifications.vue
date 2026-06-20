<script setup>
import { IconBell } from '@tabler/icons-vue'
import { usePushNotifications } from '@/features/settings/usePushNotifications'
import SettingsSection from './SettingsSection.vue'

const { enabled, loading, state, toggle } = usePushNotifications()
</script>

<template>
  <SettingsSection title="إشعارات التطبيق" description="تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز." :icon="IconBell">
    <template #actions>
      <span class="badge text-bg-light border">
        {{ state }}
      </span>
    </template>

    <button
      type="button"
      class="btn btn-sm d-inline-flex align-items-center gap-2"
      :class="enabled ? 'btn-danger' : 'btn-primary'"
      :disabled="loading"
      @click="toggle"
    >
      <IconBell size="18" />
      <span>{{ enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </button>
  </SettingsSection>
</template>
