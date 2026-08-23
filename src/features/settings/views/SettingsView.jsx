import { Link, useParams } from 'react-router-dom'
import {
  IconPalette,
  IconClockHour4,
  IconBook2,
  IconSparkles,
  IconDeviceMobile,
  IconCloudDownload,
} from '@tabler/icons-react'

import Page from '@/layout/Page'
import Heading from '@/shared/ui/Heading'

import SettingsTheme from '../components/SettingsTheme'
import SettingsFontSize from '../components/SettingsFontSize'
import SettingsPrayerTimes from '../components/SettingsPrayerTimes'
import SettingsReciter from '../components/SettingsReciter'
import SettingsTafseer from '../components/SettingsTafseer'
import SettingsDownloadAssets from '../components/SettingsDownloadAssets'
import SettingsAutoUpdate from '../components/SettingsAutoUpdate'
import SettingsNotifications from '../components/SettingsNotifications'
import SettingsImportExport from '../components/SettingsImportExport'
import SettingsZekrMoveNext from '../components/SettingsZekrMoveNext'
import SettingsZekrProgress from '../components/SettingsZekrProgress'
import SettingsZekrLeaveConfirmation from '../components/SettingsZekrLeaveConfirmation'
import SettingsZekrVibration from '../components/SettingsZekrVibration'
import { ROUTES } from '@/app/router/routes'
import { SETTINGS_TAB_IDS } from '@/features/settings/tabs'
import styles from './SettingsView.module.scss'

const TAB_BY_ID = {
  appearance: {
    label: 'المظهر',
    icon: IconPalette,
    sections: [SettingsTheme, SettingsFontSize],
  },
  prayer: {
    label: 'مواقيت الصلاة',
    icon: IconClockHour4,
    sections: [SettingsPrayerTimes],
  },
  quran: {
    label: 'القرآن',
    icon: IconBook2,
    sections: [SettingsReciter, SettingsTafseer],
  },
  azkar: {
    label: 'الأذكار',
    icon: IconSparkles,
    sections: [SettingsZekrMoveNext, SettingsZekrProgress, SettingsZekrLeaveConfirmation, SettingsZekrVibration],
  },
  app: {
    label: 'التطبيق',
    icon: IconDeviceMobile,
    sections: [SettingsAutoUpdate, SettingsNotifications, SettingsImportExport],
  },
  downloads: {
    label: 'التنزيلات',
    icon: IconCloudDownload,
    sections: [SettingsDownloadAssets],
  },
}

// Ordered by SETTINGS_TAB_IDS, the same list the router validates against.
const TABS = SETTINGS_TAB_IDS.map((id) => ({ id, ...TAB_BY_ID[id] }))

export default function SettingsView() {
  const { tab } = useParams()
  const activeTab = TABS.find((item) => item.id === tab) ?? TABS[0]

  return (
    <Page>
      <Heading className="mb-4" title="الإعدادات" subtitle="تعديل الإعدادات المختلفة للتطبيق" />

      <div className={styles.layout}>
        <nav className={`${styles.nav} tab-pills`} aria-label="أقسام الإعدادات">
          {TABS.map((item) => (
            <Link
              key={item.id}
              to={ROUTES.settingsTab(item.id)}
              className={`${styles.navItem} tab-pill ${activeTab.id === item.id ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.content}>
          <div className={styles.stack}>
            {activeTab.sections.map((Section, index) => (
              <Section key={index} />
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}
