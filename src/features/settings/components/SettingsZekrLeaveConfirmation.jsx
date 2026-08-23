import { IconDoorExit } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import SettingsToggle from './SettingsToggle'
import { useAppStore } from '@/app/stores/app'

export default function SettingsZekrLeaveConfirmation() {
  const zekrConfirmOnLeave = useAppStore((state) => state.zekrConfirmOnLeave)
  const setZekrConfirmOnLeave = useAppStore((state) => state.setZekrConfirmOnLeave)

  return (
    <SettingsSection
      title="تأكيد المغادرة"
      description="يطلب تأكيداً قبل مغادرة الذكر إذا لم يكتمل"
      icon={IconDoorExit}
      actions={
        <SettingsToggle
          checked={zekrConfirmOnLeave}
          onChange={setZekrConfirmOnLeave}
          label="تفعيل تأكيد المغادرة عند وجود أذكار غير مكتملة"
        />
      }
    />
  )
}
