import { IconArrowDownCircle } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import SettingsToggle from './SettingsToggle'
import { useAppStore } from '@/app/stores/app'

export default function SettingsZekrMoveNext() {
  const zekrMoveNextOnComplete = useAppStore((state) => state.zekrMoveNextOnComplete)
  const setZekrMoveNextOnComplete = useAppStore((state) => state.setZekrMoveNextOnComplete)

  return (
    <SettingsSection
      title="الانتقال للذكر التالي"
      description="ينقلك تلقائياً إلى الذكر التالي عند إكمال العدد المطلوب"
      icon={IconArrowDownCircle}
      actions={
        <SettingsToggle
          checked={zekrMoveNextOnComplete}
          onChange={setZekrMoveNextOnComplete}
          label="تفعيل الانتقال التلقائي للذكر التالي"
        />
      }
    />
  )
}
