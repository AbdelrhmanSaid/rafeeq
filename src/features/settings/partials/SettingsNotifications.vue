<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { IconBell } from '@tabler/icons-vue'
import { useOneSignal } from '@onesignal/onesignal-vue3'
import SettingsSection from './SettingsSection.vue'

const instance = useOneSignal()

const enabled = ref(false)
const loading = ref(true)
const state = computed(() => {
  if (loading.value) return 'جاري التحميل...'
  if (enabled.value) return 'مفعلة'
  return 'غير مفعلة'
})

async function toggleNotifications() {
  if (instance.User.PushSubscription.optedIn === true) {
    await instance.User.PushSubscription.optOut()
    toast.success('تم إيقاف الإشعارات')
  } else {
    await instance.Notifications.requestPermission()
    await instance.User.PushSubscription.optIn()
    toast.success('تم تفعيل الإشعارات')
  }

  enabled.value = instance.User.PushSubscription.optedIn === true
}

let cleanup = null

function onSubscriptionChange(event) {
  enabled.value = event.current.optedIn === true
}

onMounted(() => {
  // The OneSignal SDK loads and initializes asynchronously. During init the
  // User.PushSubscription namespace is reconstructed (and the subscription is
  // re-established via auto-resubscribe) AFTER the first OneSignalDeferred
  // callback runs. So an early one-shot read returns optedIn:false, and a change
  // listener attached then is bound to a throwaway object that never emits.
  //
  // Instead, poll the live singleton (window.OneSignal.User.PushSubscription
  // always points at the current object) until init settles, then bind the
  // change listener to that settled object for ongoing updates.
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push((OneSignal) => {
    let tries = 0
    const poll = setInterval(() => {
      const sub = OneSignal.User.PushSubscription
      enabled.value = sub.optedIn === true
      loading.value = false

      // Stop once the subscription/user is established or after ~5s.
      const settled = !!sub.id || !!OneSignal.User.onesignalId
      if (settled || ++tries >= 10) {
        clearInterval(poll)
        sub.addEventListener('change', onSubscriptionChange)
        cleanup = () => sub.removeEventListener('change', onSubscriptionChange)
      }
    }, 500)

    cleanup = () => clearInterval(poll)
  })
})

onUnmounted(() => {
  if (cleanup) cleanup()
})
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
      @click="toggleNotifications"
    >
      <IconBell size="18" />
      <span>{{ enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </button>
  </SettingsSection>
</template>
