<script setup>
import { ref } from 'vue'
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'

import { IconBell, IconCloudDownload, IconSettings } from '@tabler/icons-vue'

import SettingsReciter from './partials/SettingsReciter.vue'
import SettingsPrayerTimes from './partials/SettingsPrayerTimes.vue'
import SettingsTheme from './partials/SettingsTheme.vue'
import SettingsNotifications from './partials/SettingsNotifications.vue'
import SettingsDownloadAssets from './partials/SettingsDownloadAssets.vue'
import SettingsAppUpdates from './partials/SettingsAppUpdates.vue'

const tabs = [
  { id: 'general', label: 'عام', icon: IconSettings },
  { id: 'notifications', label: 'الإشعارات', icon: IconBell },
  { id: 'downloads', label: 'التحميلات', icon: IconCloudDownload },
]

const activeTab = ref('general')
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="واجهة إعدادات مبسطة وسهلة الاستخدام" />

    <div class="settings-shell card border-0 shadow-sm">
      <div class="card-body p-2 p-md-3">
        <div class="settings-tabs nav nav-pills mb-3" role="tablist" aria-label="أقسام الإعدادات">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-link settings-tab"
            :class="{ active: activeTab === tab.id }"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="16" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div v-show="activeTab === 'general'" class="settings-pane" role="tabpanel">
          <div class="row g-3">
            <div class="col-12 col-xl-6">
              <SettingsPrayerTimes />
            </div>
            <div class="col-12 col-xl-6">
              <SettingsReciter />
            </div>
            <div class="col-12 col-xl-6">
              <SettingsTheme />
            </div>
            <div class="col-12 col-xl-6">
              <SettingsAppUpdates />
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'notifications'" class="settings-pane" role="tabpanel">
          <SettingsNotifications />
        </div>

        <div v-show="activeTab === 'downloads'" class="settings-pane" role="tabpanel">
          <SettingsDownloadAssets />
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.settings-shell {
  background: var(--bs-body-bg);
}

.settings-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.settings-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.7rem;
  background: var(--bs-body-bg);
  color: var(--bs-secondary-color);
  padding: 0.6rem 0.75rem;
}

.settings-tab.active {
  background: var(--bs-primary);
  border-color: var(--bs-primary);
  color: #fff;
}

.settings-pane {
  min-height: 180px;
}

@media (max-width: 575.98px) {
  .settings-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
