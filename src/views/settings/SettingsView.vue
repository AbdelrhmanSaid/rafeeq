<script setup>
import { computed, ref } from 'vue'
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import {
  IconBell,
  IconBook,
  IconChevronLeft,
  IconCloudDownload,
  IconMoonStars,
  IconRefreshDot,
  IconSunFilled,
} from '@tabler/icons-vue'

import SettingsReciter from './partials/SettingsReciter.vue'
import SettingsPrayerTimes from './partials/SettingsPrayerTimes.vue'
import SettingsTheme from './partials/SettingsTheme.vue'
import SettingsNotifications from './partials/SettingsNotifications.vue'
import SettingsDownloadAssets from './partials/SettingsDownloadAssets.vue'
import SettingsAppUpdates from './partials/SettingsAppUpdates.vue'

const groups = [
  {
    title: 'الإعدادات الأساسية',
    items: [
      { id: 'prayer-times', label: 'مواقيت الصلاة', icon: IconRefreshDot, component: SettingsPrayerTimes },
      { id: 'quran', label: 'القرآن الكريم', icon: IconBook, component: SettingsReciter },
      { id: 'theme', label: 'المظهر', icon: IconSunFilled, component: SettingsTheme },
      { id: 'updates', label: 'تحديثات التطبيق', icon: IconMoonStars, component: SettingsAppUpdates },
    ],
  },
  {
    title: 'إعدادات متقدمة',
    items: [
      { id: 'notifications', label: 'الإشعارات', icon: IconBell, component: SettingsNotifications },
      { id: 'downloads', label: 'التحميلات', icon: IconCloudDownload, component: SettingsDownloadAssets },
    ],
  },
]

const flatItems = groups.flatMap((group) => group.items)
const activeItemId = ref('prayer-times')

const activeItem = computed(() => flatItems.find((item) => item.id === activeItemId.value) || flatItems[0])
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="اختر قسمًا من القائمة ثم عدّل إعداداته بسهولة" />

    <div class="settings-shell row g-3 g-lg-4">
      <div class="col-12 col-lg-4">
        <aside class="settings-menu card h-100">
          <div class="card-body p-3">
            <div v-for="group in groups" :key="group.title" class="settings-group">
              <h6 class="settings-group-title">{{ group.title }}</h6>

              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="settings-item"
                :class="{ active: activeItemId === item.id }"
                @click="activeItemId = item.id"
              >
                <span class="settings-item-start">
                  <component :is="item.icon" :size="17" />
                  <span>{{ item.label }}</span>
                </span>
                <IconChevronLeft :size="16" class="settings-item-arrow" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div class="col-12 col-lg-8">
        <section class="settings-detail card border-0 bg-transparent">
          <div class="card-body p-0">
            <div class="settings-detail-header mb-3">
              <component :is="activeItem.icon" :size="18" />
              <h5 class="m-0">{{ activeItem.label }}</h5>
            </div>

            <component :is="activeItem.component" />
          </div>
        </section>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.settings-group + .settings-group {
  margin-top: 1rem;
}

.settings-group-title {
  margin-bottom: 0.55rem;
  color: var(--bs-secondary-color);
  font-size: 0.8rem;
}

.settings-item {
  width: 100%;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.85rem;
  margin-bottom: 0.5rem;
  transition: 0.2s ease;
}

.settings-item:hover {
  background: var(--bs-tertiary-bg);
}

.settings-item.active {
  border-color: var(--bs-primary);
  background: color-mix(in srgb, var(--bs-primary) 10%, var(--bs-body-bg));
}

.settings-item-start {
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
}

.settings-item-arrow {
  color: var(--bs-secondary-color);
}

.settings-detail-header {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: var(--bs-tertiary-bg);
}
</style>
