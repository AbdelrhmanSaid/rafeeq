<script setup>
import { useId } from 'vue'
import { usePushNotifications } from '@/features/settings/composables/usePushNotifications'
import SettingsSection from './SettingsSection.vue'

const { enabled, disabled, unavailableReason, toggle } = usePushNotifications()
const switchId = useId()

function onChange(event) {
  event.target.checked = enabled.value
  toggle()
}
</script>

<template>
  <SettingsSection
    title="إشعارات التطبيق"
    :description="unavailableReason ?? 'تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز'"
    :control-id="switchId"
  >
    <template #actions>
      <div class="form-check form-switch m-0">
        <input
          :id="switchId"
          class="form-check-input"
          type="checkbox"
          role="switch"
          :checked="enabled"
          :disabled="disabled"
          aria-label="تفعيل إشعارات التطبيق"
          @change="onChange"
        />
      </div>
    </template>
  </SettingsSection>
</template>
