import { IconRefresh } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import SettingsToggle from './SettingsToggle'
import { useAppStore } from '@/app/stores/app'

export default function SettingsAutoUpdate() {
  const autoUpdateServiceWorker = useAppStore((state) => state.autoUpdateServiceWorker)
  const setAutoUpdateServiceWorker = useAppStore((state) => state.setAutoUpdateServiceWorker)

  return (
    <SettingsSection
      title="التحديث التلقائي"
      description="عند التعطيل سيتم عرض إشعار لتحديث التطبيق"
      icon={IconRefresh}
      actions={
        <SettingsToggle
          checked={autoUpdateServiceWorker}
          onChange={setAutoUpdateServiceWorker}
          label="تفعيل التحديث التلقائي"
        />
      }
    />
  )
}
