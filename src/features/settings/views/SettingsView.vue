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

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'

import SettingsTheme from '../components/SettingsTheme.vue'
import SettingsFontSize from '../components/SettingsFontSize.vue'
import SettingsPrayerTimes from '../components/SettingsPrayerTimes.vue'
import SettingsReciter from '../components/SettingsReciter.vue'
import SettingsTafseer from '../components/SettingsTafseer.vue'
import SettingsZekr from '../components/SettingsZekr.vue'
import SettingsAppUpdates from '../components/SettingsAppUpdates.vue'
import SettingsDownloadAssets from '../components/SettingsDownloadAssets.vue'

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
      <nav class="settings-nav tab-pills" aria-label="أقسام الإعدادات">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: 'settings', params: { tab: tab.id } }"
          class="settings-nav-item tab-pill"
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

        <div v-else-if="activeTab === 'quran'" class="settings-stack">
          <SettingsReciter />
          <SettingsTafseer />
        </div>

        <SettingsZekr v-else-if="activeTab === 'azkar'" />

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
  flex-direction: column;
  gap: 0.25rem;
  overflow-x: visible;
  padding: 0;
  margin: 0;
  position: sticky;
  top: calc(var(--navbar-height) + 1rem);
}

.settings-nav-item {
  width: 100%;
  flex-shrink: 1;
  padding-block: 0.7rem;
  border-color: transparent;
  font-size: 0.9rem;
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
    padding-top: 0;
    padding-bottom: 0.35rem;
    margin-inline: -0.25rem;
    padding-inline: 0.25rem;
  }

  .settings-nav-item {
    width: auto;
    flex-shrink: 0;
    border-color: var(--bs-border-color);
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
  }

  .settings-nav-item.active {
    border-color: transparent;
  }
}
</style>
