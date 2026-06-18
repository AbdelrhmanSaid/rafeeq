<script setup>
import { computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { IconBell, IconBellRinging, IconDeviceMobilePlus } from '@tabler/icons-vue'
import { toast } from 'vue-sonner'
import SettingsSection from './SettingsSection.vue'

const {
  isSupported,
  isDenied,
  isSubscribed,
  needsInstall,
  busy,
  morningEnabled,
  morningTime,
  eveningEnabled,
  eveningTime,
  prepare,
  subscribe,
  showTestNotification,
} = useNotifications()

// Pre-initialise OneSignal so the later "enable" tap can call requestPermission
// within the user-gesture window (critical on iOS). No prompt is shown here.
onMounted(() => {
  if (isSupported.value && !needsInstall.value) {
    prepare().catch(() => {})
  }
})

const permissionStatus = computed(() => {
  if (!isSupported.value) return 'غير مدعوم'
  if (needsInstall.value) return 'يتطلب التثبيت'
  if (isSubscribed.value) return 'مُفعل'
  if (isDenied.value) return 'مرفوض'
  return 'غير محدد'
})

const permissionClass = computed(() => {
  if (!isSupported.value) return 'bg-secondary'
  if (isSubscribed.value) return 'bg-success'
  if (isDenied.value) return 'bg-danger'
  if (needsInstall.value) return 'bg-info'
  return 'bg-warning'
})

async function handleSubscribe() {
  const granted = await subscribe()
  if (granted) {
    toast.success('تم تفعيل الإشعارات بنجاح.')
  } else if (isDenied.value) {
    toast.error('تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح أو النظام.')
  } else {
    toast.error('تعذّر تفعيل الإشعارات، حاول مرة أخرى.')
  }
}
</script>

<template>
  <SettingsSection
    title="إشعارات الأذكار"
    description="تلقي تذكيرات يومية لأذكار الصباح والمساء في الأوقات المحددة، حتى عند إغلاق التطبيق"
    :icon="IconBellRinging"
  >
    <template #actions>
      <span class="badge" :class="permissionClass">{{ permissionStatus }}</span>
    </template>

    <!-- iOS: must be installed to the Home Screen first (takes precedence:
         iOS Safari reports push APIs as unsupported until installed) -->
    <div v-if="needsInstall" class="alert alert-info py-2 mb-0">
      <div class="d-flex align-items-start gap-2">
        <IconDeviceMobilePlus size="1.25rem" class="flex-shrink-0 mt-1" />
        <small>
          لتفعيل الإشعارات على الآيفون، أضِف التطبيق إلى الشاشة الرئيسية أولاً: اضغط زر المشاركة في
          Safari ثم «إضافة إلى الشاشة الرئيسية»، وافتح التطبيق من الأيقونة.
        </small>
      </div>
    </div>

    <!-- Not supported -->
    <div v-else-if="!isSupported" class="alert alert-secondary py-2 mb-0">
      <small>متصفحك لا يدعم الإشعارات</small>
    </div>

    <!-- Permission denied -->
    <div v-else-if="isDenied" class="alert alert-warning py-2 mb-0">
      <small>تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح أو النظام.</small>
    </div>

    <!-- Not subscribed yet -->
    <div v-else-if="!isSubscribed">
      <p class="text-muted mb-3">
        <small>فعّل الإشعارات لتصلك تذكيرات أذكار الصباح والمساء في وقتك المحلي، حتى عند إغلاق التطبيق.</small>
      </p>
      <button
        class="btn btn-primary d-flex align-items-center gap-2"
        :disabled="busy"
        @click="handleSubscribe"
      >
        <IconBell size="1.25rem" />
        <span>{{ busy ? 'جارٍ التفعيل…' : 'تفعيل الإشعارات' }}</span>
      </button>
    </div>

    <!-- Subscribed: reminder settings -->
    <div v-else>
      <div class="row g-3">
        <!-- Morning Azkar -->
        <div class="col-12 col-md-6">
          <div class="p-3 border rounded">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-medium">أذكار الصباح</span>
              <div class="form-check form-switch">
                <input v-model="morningEnabled" class="form-check-input" type="checkbox" id="morningNotification" />
              </div>
            </div>
            <div v-if="morningEnabled" class="d-flex gap-1 align-items-center">
              <input v-model="morningTime" type="time" step="900" class="form-control" />
              <button class="btn btn-flat" @click="showTestNotification('morning')" title="تجربة">
                <IconBell size="1rem" />
              </button>
            </div>
          </div>
        </div>

        <!-- Evening Azkar -->
        <div class="col-12 col-md-6">
          <div class="p-3 border rounded">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-medium">أذكار المساء</span>
              <div class="form-check form-switch">
                <input v-model="eveningEnabled" class="form-check-input" type="checkbox" id="eveningNotification" />
              </div>
            </div>
            <div v-if="eveningEnabled" class="d-flex gap-1 align-items-center">
              <input v-model="eveningTime" type="time" step="900" class="form-control" />
              <button class="btn btn-flat" @click="showTestNotification('evening')" title="تجربة">
                <IconBell size="1rem" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p class="text-muted mt-3 mb-0">
        <small>تُضبط الأوقات لأقرب ١٥ دقيقة وتصلك في توقيتك المحلي. زر الجرس يعرض إشعاراً تجريبياً على هذا الجهاز.</small>
      </p>
    </div>
  </SettingsSection>
</template>
