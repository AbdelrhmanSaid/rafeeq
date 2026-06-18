<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { useAppStore } from '@/stores/app'
import { IconBell } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const { notificationTimezone, notificationTopics } = storeToRefs(appStore)

const availableNotificationTopics = [
  { id: 'morning-azkar', title: 'أذكار الصباح', description: 'تذكير يومي بأذكار الصباح.' },
  { id: 'evening-azkar', title: 'أذكار المساء', description: 'تذكير يومي بأذكار المساء.' },
  { id: 'monday-fast', title: 'صيام الإثنين', description: 'تذكير بصيام يوم الإثنين.' },
  { id: 'thursday-fast', title: 'صيام الخميس', description: 'تذكير بصيام يوم الخميس.' },
  { id: 'white-days-fast', title: 'الأيام البيض', description: 'تذكير بصيام ١٣ و١٤ و١٥ من الشهر الهجري.' },
  { id: 'friday-kahf', title: 'سورة الكهف', description: 'تذكير بقراءة سورة الكهف يوم الجمعة.' },
]

const permission = ref('default')
const optedIn = ref(false)
const loading = ref(false)
let oneSignal = null

const notificationsEnabled = computed(() => permission.value === 'granted' && optedIn.value)
const notificationsStatus = computed(() => {
  if (permission.value === 'unsupported') return 'غير مدعومة'
  if (permission.value === 'denied') return 'محظورة'
  return notificationsEnabled.value ? 'مفعلة' : 'غير مفعلة'
})

function updateNotificationState() {
  permission.value = 'Notification' in window ? Notification.permission : 'unsupported'
  optedIn.value = oneSignal?.User.PushSubscription.optedIn ?? false
}

async function loadOneSignal() {
  if (oneSignal) return oneSignal

  oneSignal = await new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(resolve)
  })

  updateNotificationState()
  return oneSignal
}

async function toggleNotifications() {
  loading.value = true

  try {
    const OneSignal = await loadOneSignal()

    if (notificationsEnabled.value) {
      await OneSignal.User.PushSubscription.optOut()
      toast.success('تم إيقاف الإشعارات.')
    } else if (permission.value === 'denied') {
      toast.error('الإشعارات محظورة من إعدادات المتصفح.')
    } else {
      await OneSignal.Notifications.requestPermission()
      if (Notification.permission === 'granted') await OneSignal.User.PushSubscription.optIn()
    }
  } catch {
    toast.error('تعذر تحديث إعدادات الإشعارات.')
  } finally {
    updateNotificationState()
    loading.value = false
  }
}

onMounted(() => {
  appStore.syncNotificationTimezone()
  loadOneSignal()
})
</script>

<template>
  <SettingsSection title="إشعارات التطبيق" description="تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز." :icon="IconBell">
    <template #actions>
      <span class="badge text-bg-light border">{{ notificationsStatus }}</span>
    </template>

    <button
      type="button"
      class="btn btn-sm d-inline-flex align-items-center gap-2"
      :class="notificationsEnabled ? 'btn-outline-primary' : 'btn-primary'"
      :disabled="loading || permission === 'unsupported'"
      @click="toggleNotifications"
    >
      <IconBell size="18" />
      <span>{{ notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </button>

    <div v-if="notificationsEnabled" class="notification-topics">
      <div class="small text-secondary mb-3">
        سيتم حفظ هذه الاختيارات حسب توقيت جهازك:
        <span class="fw-semibold" dir="ltr">{{ notificationTimezone }}</span>
      </div>

      <div v-for="topic in availableNotificationTopics" :key="topic.id" class="notification-topic">
        <div>
          <div class="fw-semibold">{{ topic.title }}</div>
          <div class="small text-secondary">{{ topic.description }}</div>
        </div>

        <div class="form-check form-switch m-0">
          <input
            class="form-check-input"
            type="checkbox"
            :id="`notification-${topic.id}`"
            :checked="notificationTopics.includes(topic.id)"
            @change="appStore.toggleNotificationTopic(topic.id)"
          />
        </div>
      </div>
    </div>
  </SettingsSection>
</template>

<style scoped>
.notification-topics {
  margin-top: 1rem;
}

.notification-topic {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;
  border-top: 1px solid var(--bs-border-color);
}
</style>
