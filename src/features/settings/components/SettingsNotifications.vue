<script setup>
import { useId } from 'vue'
import { usePushNotifications } from '@/features/settings/composables/usePushNotifications'
import SettingsSection from './SettingsSection.vue'

const { enabled, disabled, unavailableReason, toggle } = usePushNotifications()
const switchId = useId()

// The switch shows the subscription, not the tap: it flips only once OneSignal confirms the change.
function onChange(event) {
  event.target.checked = enabled.value
  toggle()
}
</script>

<template>
  <!-- A switch row like the other on/off settings; when it can't be used, the description says why. -->
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
