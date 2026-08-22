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

import { cn } from '@/shared/lib/utils'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'

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
    label: 'المظهر',
    icon: IconPalette,
    sections: [SettingsTheme, SettingsFontSize],
  },
  {
    id: 'prayer',
    label: 'مواقيت الصلاة',
    icon: IconClockHour4,
    sections: [SettingsPrayerTimes],
  },
  {
    id: 'quran',
    label: 'القرآن',
    icon: IconBook2,
    sections: [SettingsReciter, SettingsTafseer],
  },
  {
    id: 'azkar',
    label: 'الأذكار',
    icon: IconSparkles,
    sections: [SettingsZekrMoveNext, SettingsZekrProgress, SettingsZekrLeaveConfirmation, SettingsZekrVibration],
  },
  {
    id: 'app',
    label: 'التطبيق',
    icon: IconDeviceMobile,
    sections: [SettingsAutoUpdate, SettingsNotifications, SettingsImportExport],
  },
  {
    id: 'downloads',
    label: 'التنزيلات',
    icon: IconCloudDownload,
    sections: [SettingsDownloadAssets],
  },
]

const route = useRoute()
const activeTab = computed(() => tabs.find((tab) => tab.id === route.params.tab) ?? tabs[0])

// The pills are links, not tab state: the active section comes from
// /settings/:tab, so deep links and the back button keep working.
const tabPillClass =
  'flex shrink-0 items-center gap-3 rounded-md border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:w-full md:shrink md:border-transparent md:py-2.5'
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

    <div class="grid items-start gap-4 md:grid-cols-[15rem_1fr] md:gap-6">
      <!-- Tabs navigation — a scrollable pill strip on mobile, a sticky sidebar from md up -->
      <nav
        class="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5 md:sticky md:top-[calc(var(--navbar-height)+1rem)] md:mx-0 md:flex-col md:gap-1 md:overflow-x-visible md:px-0 md:pb-0"
        aria-label="أقسام الإعدادات"
      >
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: 'settings', params: { tab: tab.id } }"
          :class="cn(tabPillClass, activeTab.id === tab.id && 'border-transparent bg-primary/10 text-foreground')"
        >
          <component :is="tab.icon" :size="20" />
          <span>{{ tab.label }}</span>
        </RouterLink>
      </nav>

      <!-- Tab content -->
      <div class="min-w-0">
        <div class="flex flex-col gap-6">
          <component v-for="(section, index) in activeTab.sections" :key="index" :is="section" />
        </div>
      </div>
    </div>
  </Page>
</template>
