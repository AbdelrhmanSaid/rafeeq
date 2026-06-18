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

const ONE_SIGNAL_LOAD_TIMEOUT_MS = 10000
const ONE_SIGNAL_STATE_TIMEOUT_MS = 10000
const ONE_SIGNAL_EXTERNAL_ID_STORAGE_KEY = 'onesignal-notification-external-id'
const NOTIFICATION_TIMEZONE_TAG = 'notification_timezone'
const NOTIFICATION_TOPIC_TAG_PREFIX = 'notification_topic_'
const NOTIFICATION_TOPIC_TAG_VALUE = 'enabled'
const availableNotificationTopicIds = availableNotificationTopics.map((topic) => topic.id)

const permission = ref('default')
const optedIn = ref(false)
const notificationsLoading = ref(false)
const syncingTopics = ref(false)
let oneSignal = null
let oneSignalLoadPromise = null
let oneSignalLoginPromise = null
let fallbackOneSignalExternalId = null

const notificationsEnabled = computed(() => permission.value === 'granted' && optedIn.value)
const notificationsStatus = computed(() => {
  if (permission.value === 'unsupported') return 'غير مدعومة'
  if (permission.value === 'denied') return 'محظورة'
  return notificationsEnabled.value ? 'مفعلة' : 'غير مفعلة'
})

function getBrowserNotificationPermission() {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

function updateNotificationState() {
  permission.value = getBrowserNotificationPermission()
  optedIn.value = oneSignal?.User?.PushSubscription?.optedIn ?? false
}

async function loadOneSignal() {
  if (oneSignal) return oneSignal
  if (permission.value === 'unsupported') throw new Error('Browser notifications are not supported.')

  oneSignalLoadPromise ??= new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error('OneSignal SDK failed to load.'))
    }, ONE_SIGNAL_LOAD_TIMEOUT_MS)

    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push((sdk) => {
      window.clearTimeout(timeout)
      resolve(sdk)
    })
  })
    .then((sdk) => {
      oneSignal = sdk
      updateNotificationState()
      return sdk
    })
    .catch((error) => {
      oneSignalLoadPromise = null
      throw error
    })

  return oneSignalLoadPromise
}

function createOneSignalExternalId() {
  const randomId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `rafeeq-web-${randomId}`
}

function getOneSignalExternalId() {
  if (fallbackOneSignalExternalId) return fallbackOneSignalExternalId

  try {
    const existingExternalId = window.localStorage.getItem(ONE_SIGNAL_EXTERNAL_ID_STORAGE_KEY)

    if (existingExternalId) {
      fallbackOneSignalExternalId = existingExternalId
      return existingExternalId
    }

    const externalId = createOneSignalExternalId()
    window.localStorage.setItem(ONE_SIGNAL_EXTERNAL_ID_STORAGE_KEY, externalId)
    fallbackOneSignalExternalId = externalId
    return externalId
  } catch {
    fallbackOneSignalExternalId = createOneSignalExternalId()
    return fallbackOneSignalExternalId
  }
}

async function waitForOneSignalState(predicate, errorMessage) {
  if (predicate()) return

  await new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      if (predicate()) {
        window.clearInterval(interval)
        resolve()
        return
      }

      if (Date.now() - startedAt >= ONE_SIGNAL_STATE_TIMEOUT_MS) {
        window.clearInterval(interval)
        reject(new Error(errorMessage))
      }
    }, 100)
  })

  updateNotificationState()
}

async function identifyOneSignalUser(OneSignal) {
  const externalId = getOneSignalExternalId()

  if (OneSignal.User.externalId === externalId) return externalId

  oneSignalLoginPromise ??= Promise.resolve(OneSignal.login(externalId))
    .then(() =>
      waitForOneSignalState(
        () => OneSignal.User.externalId === externalId && Boolean(OneSignal.User.onesignalId),
        'OneSignal user failed to initialize.',
      ),
    )
    .catch((error) => {
      oneSignalLoginPromise = null
      throw error
    })

  await oneSignalLoginPromise
  return externalId
}

async function loadReadyOneSignalUser({ requireSubscription = false } = {}) {
  const OneSignal = await loadOneSignal()
  const externalId = await identifyOneSignalUser(OneSignal)

  await waitForOneSignalState(
    () => OneSignal.User.externalId === externalId && Boolean(OneSignal.User.onesignalId),
    'OneSignal user failed to initialize.',
  )

  if (requireSubscription) {
    await waitForOneSignalState(
      () => Boolean(OneSignal.User.PushSubscription.id),
      'OneSignal push subscription failed to initialize.',
    )
  }

  return OneSignal
}

function getNotificationTopicTagName(topicId) {
  return `${NOTIFICATION_TOPIC_TAG_PREFIX}${topicId.replaceAll('-', '_')}`
}

function isNotificationTopicSelected(topicId) {
  return notificationTopics.value.includes(topicId)
}

function toggleTopic(topics, topicId) {
  const selectedTopics = new Set(topics)

  if (selectedTopics.has(topicId)) {
    selectedTopics.delete(topicId)
  } else {
    selectedTopics.add(topicId)
  }

  return availableNotificationTopicIds.filter((availableTopicId) => selectedTopics.has(availableTopicId))
}

function buildNotificationTagUpdate(topics) {
  const selectedTopics = new Set(topics)
  const tagsToAdd = {
    [NOTIFICATION_TIMEZONE_TAG]: notificationTimezone.value,
  }
  const tagsToRemove = []

  for (const topicId of availableNotificationTopicIds) {
    const tagName = getNotificationTopicTagName(topicId)

    if (selectedTopics.has(topicId)) {
      tagsToAdd[tagName] = NOTIFICATION_TOPIC_TAG_VALUE
    } else {
      tagsToRemove.push(tagName)
    }
  }

  return { tagsToAdd, tagsToRemove }
}

async function syncNotificationTags(OneSignal = oneSignal, { requireEnabled = true } = {}) {
  if (!OneSignal) return
  if (requireEnabled && !notificationsEnabled.value) return

  appStore.syncNotificationTimezone()
  const { tagsToAdd, tagsToRemove } = buildNotificationTagUpdate(notificationTopics.value)

  if (tagsToRemove.length > 0) {
    OneSignal.User.removeTags(tagsToRemove)
  }

  OneSignal.User.addTags(tagsToAdd)
}

async function toggleNotificationTopic(topicId) {
  const previousTopics = [...notificationTopics.value]
  notificationTopics.value = toggleTopic(previousTopics, topicId)
  syncingTopics.value = true

  try {
    const OneSignal = await loadReadyOneSignalUser({ requireSubscription: true })
    await syncNotificationTags(OneSignal)
    toast.success('تم تحديث تفضيلات الإشعارات.')
  } catch {
    notificationTopics.value = previousTopics
    toast.error('تعذر حفظ تفضيلات الإشعارات.')
  } finally {
    updateNotificationState()
    syncingTopics.value = false
  }
}

async function toggleNotifications() {
  notificationsLoading.value = true

  try {
    const OneSignal = await loadReadyOneSignalUser()

    if (notificationsEnabled.value) {
      await OneSignal.User.PushSubscription.optOut()
      toast.success('تم إيقاف الإشعارات.')
    } else if (permission.value === 'denied') {
      toast.error('الإشعارات محظورة من إعدادات المتصفح.')
    } else {
      await OneSignal.Notifications.requestPermission()
      updateNotificationState()

      if (permission.value === 'granted') {
        await OneSignal.User.PushSubscription.optIn()
        updateNotificationState()
        await loadReadyOneSignalUser({ requireSubscription: true })
        await syncNotificationTags(OneSignal, { requireEnabled: false })
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

onMounted(() => {
  updateNotificationState()
  appStore.syncNotificationTimezone()
  if (permission.value !== 'unsupported') loadOneSignal().catch(() => {})
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
            :checked="isNotificationTopicSelected(topic.id)"
            :disabled="syncingTopics"
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
