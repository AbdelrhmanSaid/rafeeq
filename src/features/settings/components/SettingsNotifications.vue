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
      <Badge variant="outline" class="border-0 bg-muted px-3 py-1 text-muted-foreground">
        {{ state }}
      </Badge>
    </template>

    <Button
      type="button"
      :variant="enabled ? 'destructive' : 'default'"
      class="h-11 w-full rounded-full active:scale-95"
      :disabled="loading"
      @click="toggle"
    >
      <IconBell class="size-4" />
      <span>{{ enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </Button>
  </SettingsSection>
</template>
