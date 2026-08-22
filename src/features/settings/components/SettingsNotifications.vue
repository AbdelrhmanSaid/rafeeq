<script setup>
import { IconBell } from '@tabler/icons-vue'
import { usePushNotifications } from '@/features/settings/composables/usePushNotifications'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import SettingsSection from './SettingsSection.vue'

const { enabled, loading, state, toggle } = usePushNotifications()
</script>

<template>
  <SettingsSection title="إشعارات التطبيق" description="تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز." :icon="IconBell">
    <template #actions>
      <Badge variant="outline">
        {{ state }}
      </Badge>
    </template>

    <Button type="button" size="sm" :variant="enabled ? 'destructive' : 'default'" :disabled="loading" @click="toggle">
      <IconBell />
      <span>{{ enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </Button>
  </SettingsSection>
</template>
