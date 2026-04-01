<script setup>
import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'

import {
  IconBell,
  IconCloudDownload,
  IconDeviceMobileCog,
  IconMoonStars,
  IconQuran,
  IconSettings2,
  IconSunHigh,
} from '@tabler/icons-vue'

import SettingsReciter from './partials/SettingsReciter.vue'
import SettingsPrayerTimes from './partials/SettingsPrayerTimes.vue'
import SettingsTheme from './partials/SettingsTheme.vue'
import SettingsNotifications from './partials/SettingsNotifications.vue'
import SettingsDownloadAssets from './partials/SettingsDownloadAssets.vue'
import SettingsAppUpdates from './partials/SettingsAppUpdates.vue'

const sectionLinks = [
  { id: 'settings-general', label: 'عام', icon: IconSettings2 },
  { id: 'settings-notifications', label: 'الإشعارات', icon: IconBell },
  { id: 'settings-downloads', label: 'التحميلات', icon: IconCloudDownload },
]
</script>

<template>
  <Page>
    <Heading class="mb-4" title="الإعدادات" subtitle="تخصيص التطبيق بطريقة مرتبة وسهلة" />

    <div class="row g-3 g-lg-4 align-items-start settings-layout">
      <div class="col-12 col-lg-3">
        <nav class="settings-nav card">
          <div class="card-body py-2 px-2">
            <a
              v-for="section in sectionLinks"
              :key="section.id"
              class="settings-nav-link"
              :href="`#${section.id}`"
            >
              <component :is="section.icon" :size="16" />
              <span>{{ section.label }}</span>
            </a>
          </div>
        </nav>
      </div>

      <div class="col-12 col-lg-9">
        <div class="vstack gap-3 gap-lg-4">
          <section id="settings-general" class="settings-section">
            <div class="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
              <IconDeviceMobileCog :size="16" />
              <span>الإعدادات العامة</span>
            </div>

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
          </section>

          <section id="settings-notifications" class="settings-section">
            <div class="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
              <IconSunHigh :size="16" />
              <IconMoonStars :size="16" />
              <span>إشعارات الأذكار</span>
            </div>
            <SettingsNotifications />
          </section>

          <section id="settings-downloads" class="settings-section">
            <div class="d-flex align-items-center gap-2 mb-2 text-muted small fw-semibold">
              <IconQuran :size="16" />
              <span>المحتوى المحمّل</span>
            </div>
            <SettingsDownloadAssets />
          </section>
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.settings-layout {
  scroll-margin-top: 1rem;
}

.settings-nav {
  position: sticky;
  top: 0.75rem;
  overflow-x: auto;
}

.settings-nav .card-body {
  display: flex;
  gap: 0.5rem;

  @media (min-width: 992px) {
    flex-direction: column;
  }
}

.settings-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.65rem;
  text-decoration: none;
  color: var(--bs-body-color);
  white-space: nowrap;
  background: var(--bs-body-bg);

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  @media (min-width: 992px) {
    justify-content: flex-start;
  }
}

.settings-section {
  scroll-margin-top: 1rem;
}
</style>
