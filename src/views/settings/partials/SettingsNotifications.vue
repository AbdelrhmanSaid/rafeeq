<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { useAppStore } from '@/stores/app'
import { IconBell, IconAlertCircle } from '@tabler/icons-vue'
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
const notificationsLoading = ref(false)

const messagesMap = {
  unsupported: 'غير مدعومة',
  denied: 'محظورة',
  granted: 'مفعلة',
  default: 'غير مفعلة',
}

const notificationsEnabled = computed(() => permission.value === 'granted')
const notificationsStatus = computed(() => messagesMap[permission.value] ?? messagesMap.default)

function updateNotificationState() {
  permission.value = typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
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
    if (notificationsEnabled.value) {
      toast.info('يمكن إيقاف الإشعارات من إعدادات المتصفح.')
    } else if (permission.value === 'denied') {
      toast.error('الإشعارات محظورة من إعدادات المتصفح.')
    } else {
      permission.value = await Notification.requestPermission()
      if (notificationsEnabled.value) toast.success('تم تفعيل الإشعارات.')
    }
  } catch {
    toast.error('تعذر تحديث إعدادات الإشعارات.')
  } finally {
    updateNotificationState()
    notificationsLoading.value = false
  }
}

onMounted(() => {
  updateNotificationState()
  appStore.syncNotificationTimezone()
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
      :disabled="notificationsLoading || permission === 'unsupported'"
      @click="toggleNotifications"
    >
      <IconBell size="18" />
      <span>{{ notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات' }}</span>
    </button>

    <div class="alert alert-warning mt-3 mb-0">
      <IconAlertCircle class="me-2" size="18" />
      <span>الإشعارات لا تعمل في الوقت الحالي، جاري العمل على حل المشكلة.</span>
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
