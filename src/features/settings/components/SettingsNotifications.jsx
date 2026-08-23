import { IconBell } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import { usePushNotifications } from '@/features/settings/hooks/usePushNotifications'

export default function SettingsNotifications() {
  const { enabled, loading, state, toggle } = usePushNotifications()

  return (
    <SettingsSection
      title="إشعارات التطبيق"
      description="تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز."
      icon={IconBell}
      actions={<span className="badge text-bg-light border">{state}</span>}
    >
      <button
        type="button"
        className={`btn btn-sm d-inline-flex align-items-center gap-2 ${enabled ? 'btn-danger' : 'btn-primary'}`}
        disabled={loading}
        onClick={toggle}
      >
        <IconBell size="18" />
        <span>{enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}</span>
      </button>
    </SettingsSection>
  )
}
