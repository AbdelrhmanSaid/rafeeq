import { IconBell } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import { usePushNotifications } from '@/features/settings/hooks/usePushNotifications'

export default function SettingsNotifications() {
  const { enabled, loading, available, state, toggle } = usePushNotifications()

  return (
    <SettingsSection
      title="إشعارات التطبيق"
      description="تفعيل أو إيقاف إشعارات المتصفح لهذا الجهاز."
      icon={IconBell}
      actions={<span className="badge text-bg-light border">{state}</span>}
    >
      {!available && !loading && (
        <p className="small text-body-secondary mb-2">
          الإشعارات غير مدعومة في هذا المتصفح، أو تعذّر تحميل خدمة الإشعارات.
        </p>
      )}
      <button
        type="button"
        className={`btn btn-sm d-inline-flex align-items-center gap-2 ${enabled ? 'btn-danger' : 'btn-primary'}`}
        disabled={loading || !available}
        onClick={toggle}
      >
        <IconBell size="18" />
        <span>{enabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}</span>
      </button>
    </SettingsSection>
  )
}
