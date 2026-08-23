import { IconDeviceFloppy } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import SettingsToggle from './SettingsToggle'
import { useAppStore } from '@/app/stores/app'

export default function SettingsZekrProgress() {
  const zekrSaveProgress = useAppStore((state) => state.zekrSaveProgress)
  const setZekrSaveProgress = useAppStore((state) => state.setZekrSaveProgress)

  return (
    <SettingsSection
      title="حفظ التقدم"
      description="يحفظ تقدمك في كل قسم من الأذكار ويعيد ضبطه يومياً"
      icon={IconDeviceFloppy}
      actions={
        <SettingsToggle checked={zekrSaveProgress} onChange={setZekrSaveProgress} label="تفعيل حفظ تقدم الأذكار" />
      }
    />
  )
}
