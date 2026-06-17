<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  IconPalette,
  IconClockHour4,
  IconBook2,
  IconSparkles,
  IconDeviceMobile,
  IconCloudDownload,
} from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'

import SettingsTheme from './partials/SettingsTheme.vue'
import SettingsFontSize from './partials/SettingsFontSize.vue'
import SettingsPrayerTimes from './partials/SettingsPrayerTimes.vue'
import SettingsReciter from './partials/SettingsReciter.vue'
import SettingsZekr from './partials/SettingsZekr.vue'
import SettingsNotifications from './partials/SettingsNotifications.vue'
import SettingsAppUpdates from './partials/SettingsAppUpdates.vue'
import SettingsDownloadAssets from './partials/SettingsDownloadAssets.vue'

const tabs = [
  { id: 'appearance', label: 'المظهر', icon: IconPalette },
  { id: 'prayer', label: 'مواقيت الصلاة', icon: IconClockHour4 },
  { id: 'quran', label: 'القرآن', icon: IconBook2 },
  { id: 'azkar', label: 'الأذكار', icon: IconSparkles },
  { id: 'app', label: 'التطبيق', icon: IconDeviceMobile },
  { id: 'downloads', label: 'التنزيلات', icon: IconCloudDownload },
]

const route = useRoute()
const activeTab = computed(() => route.params.tab || 'appearance')
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

    <div class="settings-layout">
      <!-- Tabs navigation -->
      <nav class="settings-nav" aria-label="أقسام الإعدادات">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: 'settings', params: { tab: tab.id } }"
          class="settings-nav-item"
          :class="{ active: activeTab === tab.id }"
        >
          <component :is="tab.icon" :size="20" />
          <span>{{ tab.label }}</span>
        </RouterLink>
      </nav>

      <!-- Tab content -->
      <div class="settings-content">
        <div v-if="activeTab === 'appearance'" class="settings-stack">
          <SettingsTheme />
          <SettingsFontSize />
        </div>

        <SettingsPrayerTimes v-else-if="activeTab === 'prayer'" />

        <SettingsReciter v-else-if="activeTab === 'quran'" />

        <div v-else-if="activeTab === 'azkar'" class="settings-stack">
          <SettingsZekr />
          <SettingsNotifications />
        </div>

        <SettingsAppUpdates v-else-if="activeTab === 'app'" />

        <SettingsDownloadAssets v-else-if="activeTab === 'downloads'" />
      </div>
    </div>
  </Page>
</template>

<style scoped>
.settings-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* Navigation — sidebar on desktop */
.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: sticky;
  top: calc(var(--navbar-height) + 1rem);
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--bs-secondary-color);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.settings-nav-item:hover {
  background: rgba(var(--bs-secondary-rgb), 0.1);
  color: var(--bs-body-color);
}

.settings-nav-item.active {
  background: color-mix(in srgb, var(--bs-primary) 12%, transparent);
}

.settings-nav-item svg {
  flex-shrink: 0;
}

.settings-content {
  min-width: 0;
}

.settings-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Mobile — horizontal scrollable pills */
@media (max-width: 767.98px) {
  .settings-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .settings-nav {
    flex-direction: row;
    position: static;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    margin-inline: -0.25rem;
    padding-inline: 0.25rem;
    scrollbar-width: none;
  }

  .settings-nav::-webkit-scrollbar {
    display: none;
  }

  .settings-nav-item {
    width: auto;
    flex-shrink: 0;
    border-color: var(--bs-border-color);
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
  }

  .settings-nav-item.active {
    border-color: transparent;
  }
}
</style>
