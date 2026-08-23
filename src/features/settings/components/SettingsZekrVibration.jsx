import { IconDeviceMobileVibration } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import SettingsToggle from './SettingsToggle'
import { useAppStore } from '@/app/stores/app'
import { toArabicNumerals } from '@/shared/utils/arabic'

export default function SettingsZekrVibration() {
  const enabled = useAppStore((state) => state.zekrVibrationEnabled)
  const setEnabled = useAppStore((state) => state.setZekrVibrationEnabled)
  const intensity = useAppStore((state) => state.zekrVibrationIntensity)
  const setIntensity = useAppStore((state) => state.setZekrVibrationIntensity)

  return (
    <SettingsSection
      title="الاهتزاز عند الانتهاء"
      description="يعمل على الأجهزة والمتصفحات التي تدعم الاهتزاز"
      icon={IconDeviceMobileVibration}
      actions={<SettingsToggle checked={enabled} onChange={setEnabled} label="تفعيل الاهتزاز عند إتمام الذكر" />}
    >
      {enabled && (
        <div className="p-3 border rounded">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
            <span>قوة الاهتزاز</span>
            <small className="text-muted">{toArabicNumerals(intensity)} مللي ثانية</small>
          </div>

          <input
            value={intensity}
            onChange={(event) => setIntensity(Number(event.target.value))}
            className="form-range"
            type="range"
            min="20"
            max="250"
            step="10"
            aria-label="قوة الاهتزاز"
          />

          <div className="d-flex justify-content-between text-muted">
            <small>خفيف</small>
            <small>قوي</small>
          </div>
        </div>
      )}
    </SettingsSection>
  )
}
