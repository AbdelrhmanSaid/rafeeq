<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { useOneSignal } from '@onesignal/onesignal-vue3'
import { useAppStore } from '@/stores/app'
import { IconBell, IconAlertCircle } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'

const appStore = useAppStore()
const OneSignal = useOneSignal()
const { notificationTimezone, notificationTopics } = storeToRefs(appStore)

const availableNotificationTopics = [
  { id: 'morning-azkar', title: 'أذكار الصباح', description: 'تذكير يومي بأذكار الصباح.' },
  { id: 'evening-azkar', title: 'أذكار المساء', description: 'تذكير يومي بأذكار المساء.' },
  { id: 'monday-fast', title: 'صيام الإثنين', description: 'تذكير بصيام يوم الإثنين.' },
  { id: 'thursday-fast', title: 'صيام الخميس', description: 'تذكير بصيام يوم الخميس.' },
  { id: 'white-days-fast', title: 'الأيام البيض', description: 'تذكير بصيام ١٣ و١٤ و١٥ من الشهر الهجري.' },
  { id: 'friday-kahf', title: 'سورة الكهف', description: 'تذكير بقراءة سورة الكهف يوم الجمعة.' },
]

const notificationTagKeys = availableNotificationTopics.map(({ id }) => id)
const permission = ref('default')
const pushOptedIn = ref(false)
const notificationsLoading = ref(false)
let syncTagsTimeout

const messagesMap = {
  unsupported: 'غير مدعومة',
  denied: 'محظورة',
  granted: 'مفعلة',
  default: 'غير مفعلة',
}

const notificationState = computed(() => {
  if (permission.value === 'unsupported') return 'unsupported'
  if (permission.value === 'denied') return 'denied'
  return permission.value === 'granted' && pushOptedIn.value ? 'granted' : 'default'
})
const notificationsEnabled = computed(() => notificationState.value === 'granted')
const notificationsStatus = computed(() => messagesMap[notificationState.value] ?? messagesMap.default)

function notificationsSupported() {
  return typeof Notification !== 'undefined' && OneSignal.Notifications.isPushSupported()
}

function updateNotificationState() {
  if (!notificationsSupported()) {
    permission.value = 'unsupported'
    pushOptedIn.value = false
    return
  }

  permission.value = OneSignal.Notifications.permissionNative || Notification.permission
  pushOptedIn.value = OneSignal.User.PushSubscription.optedIn === true
}

function syncNotificationTags() {
  if (!notificationsEnabled.value) return

  const selectedTopics = new Set(notificationTopics.value)
  const tags = { notification_timezone: notificationTimezone.value }

  notificationTagKeys.forEach((id) => {
    if (selectedTopics.has(id)) tags[id] = 'true'
  })

  OneSignal.User.addTags(tags)
  OneSignal.User.removeTags(notificationTagKeys.filter((id) => !selectedTopics.has(id)))
}

function queueNotificationTagsSync() {
  window.clearTimeout(syncTagsTimeout)
  syncTagsTimeout = window.setTimeout(syncNotificationTags, 400)
}

function toggleNotificationTopic(topicId) {
  const selectedTopics = new Set(notificationTopics.value)
  selectedTopics.has(topicId) ? selectedTopics.delete(topicId) : selectedTopics.add(topicId)
  notificationTopics.value = availableNotificationTopics.map(({ id }) => id).filter((id) => selectedTopics.has(id))
  toast.success('تم تحديث تفضيلات الإشعارات.')
}

async function toggleNotifications() {
  notificationsLoading.value = true

  try {
    updateNotificationState()

    if (notificationsEnabled.value) {
      await OneSignal.User.PushSubscription.optOut()
      toast.success('تم إيقاف الإشعارات.')
    } else if (permission.value === 'denied') {
      toast.error('الإشعارات محظورة من إعدادات المتصفح.')
    } else {
      const allowed = permission.value === 'granted' || (await OneSignal.Notifications.requestPermission())
      if (allowed) {
        await OneSignal.User.PushSubscription.optIn()
        syncNotificationTags()
        toast.success('تم تفعيل الإشعارات.')
      }
    }
  } catch {
    toast.error('تعذر تحديث إعدادات الإشعارات.')
  } finally {
    updateNotificationState()
    notificationsLoading.value = false
  }
}

function handleNotificationChange() {
  updateNotificationState()
  queueNotificationTagsSync()
}

onMounted(() => {
  updateNotificationState()
  appStore.syncNotificationTimezone()
  OneSignal.Notifications.addEventListener('permissionChange', handleNotificationChange)
  OneSignal.User.PushSubscription.addEventListener('change', handleNotificationChange)
  window.OneSignalDeferred?.push(handleNotificationChange)
})

onBeforeUnmount(() => {
  window.clearTimeout(syncTagsTimeout)
  OneSignal.Notifications.removeEventListener('permissionChange', handleNotificationChange)
  OneSignal.User.PushSubscription.removeEventListener('change', handleNotificationChange)
})

watch([notificationTopics, notificationTimezone], queueNotificationTagsSync, { deep: true })
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
      :disabled="notificationsLoading || permission === 'unsupported'"
      @click="toggleNotifications"
    >
      <IconBell size="18" />
      <span>{{ notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </button>

    <div v-if="permission === 'denied'" class="alert alert-warning mt-3 mb-0">
      <IconAlertCircle class="me-2" size="18" />
      <span>الإشعارات محظورة من إعدادات المتصفح. غيّر الإذن من المتصفح لتفعيلها مرة أخرى.</span>
     </div>

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
            @change="toggleNotificationTopic(topic.id)"
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
