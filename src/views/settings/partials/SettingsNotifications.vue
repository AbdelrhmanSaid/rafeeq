<script setup>
import { computed } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import { IconBell } from '@tabler/icons-vue'

const {
  isSupported,
  isGranted,
  isDenied,
  canRequest,
  morningEnabled,
  morningTime,
  eveningEnabled,
  eveningTime,
  requestPermission,
  showTestNotification,
} = useNotifications()

// Permission status
const permissionStatus = computed(() => {
  if (!isSupported.value) return 'غير مدعوم'
  if (isGranted.value) return 'مُفعل'
  if (isDenied.value) return 'مرفوض'
  return 'غير محدد'
})

const permissionClass = computed(() => {
  if (!isSupported.value) return 'bg-secondary'
  if (isGranted.value) return 'bg-success'
  if (isDenied.value) return 'bg-danger'
  return 'bg-warning'
})

// Handle permission request
async function handleRequestPermission() {
  const granted = await requestPermission()
  if (!granted) {
    alert('تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.')
  }
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="card-title mb-0">إشعارات الأذكار</h6>
        <span class="badge" :class="permissionClass">{{ permissionStatus }}</span>
      </div>

      <p class="card-text text-muted mb-3">تلقي تذكيرات يومية لأذكار الصباح والمساء في الأوقات المحددة</p>

      <!-- Status Messages -->
      <div v-if="!isSupported || isDenied" class="mb-3">
        <div v-if="!isSupported" class="alert alert-secondary py-2">
          <small>متصفحك لا يدعم الإشعارات</small>
        </div>

        <div v-else-if="isDenied" class="alert alert-warning py-2">
          <small>تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.</small>
        </div>
      </div>

      <!-- Notification Settings -->
      <div v-if="isGranted" class="mb-3">
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
              <div v-if="morningEnabled" class="d-flex gap-2 align-items-center">
                <input v-model="morningTime" type="time" class="form-control" />
                <button class="btn btn-outline-primary" @click="showTestNotification('morning')" title="تجربة">
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
              <div v-if="eveningEnabled" class="d-flex gap-2 align-items-center">
                <input v-model="eveningTime" type="time" class="form-control" />
                <button class="btn btn-outline-primary" @click="showTestNotification('evening')" title="تجربة">
                  <IconBell size="1rem" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div v-if="canRequest" class="d-flex gap-2">
        <button class="btn btn-primary d-flex align-items-center gap-2" @click="handleRequestPermission">
          <IconBell size="1.25rem" />
          <span>تفعيل الإشعارات</span>
        </button>
      </div>
    </div>
  </div>
</template>
