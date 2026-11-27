<script setup>
import { computed, provide } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  IconChevronLeft,
  IconPalette,
  IconClockHour4,
  IconBook2,
  IconSparkles,
  IconDeviceMobile,
  IconCloudDownload,
} from '@tabler/icons-vue'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import { SETTINGS_PAGE_TITLE, SETTINGS_SECTION_LABELS } from '../lib/sections'

import SettingsTheme from '../components/SettingsTheme.vue'
import SettingsFontSize from '../components/SettingsFontSize.vue'
import SettingsPrayerTimes from '../components/SettingsPrayerTimes.vue'
import SettingsReciter from '../components/SettingsReciter.vue'
import SettingsTafseer from '../components/SettingsTafseer.vue'
import SettingsDownloadAssets from '../components/SettingsDownloadAssets.vue'
import SettingsAutoUpdate from '../components/SettingsAutoUpdate.vue'
import SettingsNotifications from '../components/SettingsNotifications.vue'
import SettingsImportExport from '../components/SettingsImportExport.vue'
import SettingsZekrMoveNext from '../components/SettingsZekrMoveNext.vue'
import SettingsZekrProgress from '../components/SettingsZekrProgress.vue'
import SettingsZekrLeaveConfirmation from '../components/SettingsZekrLeaveConfirmation.vue'
import SettingsZekrVibration from '../components/SettingsZekrVibration.vue'

const tabs = [
  {
    id: 'appearance',
    label: SETTINGS_SECTION_LABELS.appearance,
    icon: IconPalette,
    sections: [SettingsTheme, SettingsFontSize],
  },
  {
    id: 'prayer',
    label: SETTINGS_SECTION_LABELS.prayer,
    icon: IconClockHour4,
    sections: [SettingsPrayerTimes],
  },
  {
    id: 'quran',
    label: SETTINGS_SECTION_LABELS.quran,
    icon: IconBook2,
    sections: [SettingsReciter, SettingsTafseer],
  },
  {
    id: 'azkar',
    label: SETTINGS_SECTION_LABELS.azkar,
    icon: IconSparkles,
    sections: [SettingsZekrMoveNext, SettingsZekrProgress, SettingsZekrLeaveConfirmation, SettingsZekrVibration],
  },
  {
    id: 'app',
    label: SETTINGS_SECTION_LABELS.app,
    icon: IconDeviceMobile,
    sections: [SettingsAutoUpdate, SettingsNotifications, SettingsImportExport],
  },
  {
    id: 'downloads',
    label: SETTINGS_SECTION_LABELS.downloads,
    icon: IconCloudDownload,
    sections: [SettingsDownloadAssets],
    // Lays out its own grouped lists.
    ungrouped: true,
  },
]

const route = useRoute()
// /settings lists the sections; /settings/<section> shows one of them on its own screen.
const activeTab = computed(() => tabs.find((tab) => tab.id === route.params.tab) ?? null)

// A section titled like the screen (المظهر on المظهر) drops the repeated title; see SettingsSection.
provide(
  SETTINGS_PAGE_TITLE,
  computed(() => activeTab.value?.label ?? null),
)
</script>

<template>
  <Page v-if="activeTab">
    <Heading class="mb-4" :title="activeTab.label" />

    <!-- One grouped list per section: each setting is a row, separated by hairlines. -->
    <div :class="{ 'settings-group': !activeTab.ungrouped }">
      <component v-for="(section, index) in activeTab.sections" :key="index" :is="section" />
    </div>
  </Page>

  <Page v-else>
    <Heading class="mb-4" subtitle-desktop-only title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

    <!-- The sections, as rows like the More screen. -->
    <nav class="settings-list" aria-label="أقسام الإعدادات">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.id"
        :to="{ name: 'settings-section', params: { tab: tab.id } }"
        class="settings-row"
      >
        <span class="icon-tile settings-row__icon"><component :is="tab.icon" aria-hidden="true" /></span>
        <span class="settings-row__label">{{ tab.label }}</span>
        <IconChevronLeft class="settings-row__chevron" aria-hidden="true" />
      </RouterLink>
    </nav>
  </Page>
</template>

<style lang="scss" scoped>
/* An inset grouped list, matching the More screen. */
.settings-list,
.settings-group {
  overflow: hidden;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-lg);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

/* Settings inside a section sit as rows with full-width hairlines between them. */
.settings-group > :deep(* + *) {
  border-top: 1px solid var(--app-hairline);
}

/* Sized like the More screen's rows: px chrome, so a large text size goes to the label. */
.settings-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 3.5rem;
  padding: 0.625rem 16px;
  color: var(--bs-body-color);
  text-decoration: none;

  & + & {
    border-top: 1px solid var(--app-hairline);
  }

  &:active {
    background: var(--app-surface-active);
  }
}

@media (hover: hover) and (pointer: fine) {
  .settings-row:hover {
    background: var(--app-surface-hover);
  }
}

.settings-row__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  color: var(--app-primary-ink);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

[data-bs-theme='dark'] .settings-row__icon {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}

.settings-row__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-row__chevron {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--bs-secondary-color);
}

[dir='ltr'] .settings-row__chevron {
  transform: scaleX(-1);
}
</style>
