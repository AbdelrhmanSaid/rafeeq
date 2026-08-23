<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-accent hover:text-accent-foreground active:scale-[0.98] md:w-full md:shrink md:rounded-2xl'
const tabPillActiveClass = 'bg-primary/12 text-primary hover:bg-primary/12 hover:text-primary'

// The strip scrolls sideways on the phone, so a deep link to a later tab would
// otherwise land with its pill off-screen; nudge the active one into view.
const strip = ref(null)

async function revealActiveTab() {
  await nextTick()
  const pill = strip.value?.querySelector('[data-active="true"]')
  if (typeof pill?.scrollIntoView === 'function') {
    pill.scrollIntoView({ inline: 'center', block: 'nearest' })
  }
}

onMounted(revealActiveTab)
watch(() => activeTab.value.id, revealActiveTab)
</script>

<template>
  <Page>
    <Heading title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

    <div class="grid items-start gap-4 md:grid-cols-[15rem_1fr] md:gap-8">
      <!-- Tabs navigation — a scrolling pill strip that bleeds past the page
           gutter on the phone (faded at both ends so it reads as continuing),
           and a sticky sidebar of full-width rows from md up. -->
      <nav
        ref="strip"
        class="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 edge-fade-x no-scrollbar md:sticky md:top-[calc(var(--navbar-height)+1rem)] md:mx-0 md:flex-col md:gap-1 md:overflow-x-visible md:px-0 md:[mask-image:none]"
        style="--edge-fade-size: 1rem"
        aria-label="أقسام الإعدادات"
      >
        <RouterLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="{ name: 'settings', params: { tab: tab.id } }"
          :data-active="activeTab.id === tab.id"
          :class="cn(tabPillClass, activeTab.id === tab.id && tabPillActiveClass)"
        >
          <component :is="tab.icon" class="size-5 shrink-0" />
          <span>{{ tab.label }}</span>
        </RouterLink>
      </nav>

      <!-- Tab content: one card per setting, close together so the tab reads as
           a single grouped list rather than a stack of unrelated panels. -->
      <div class="min-w-0 space-y-3">
        <component v-for="(section, index) in activeTab.sections" :key="index" :is="section" />
      </div>
    </div>
  </Page>
</template>
