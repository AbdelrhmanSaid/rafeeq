import { IconTextSize, IconRotate } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import { useThemeStore } from '@/app/stores/theme'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { MIN_FONT_SCALE, MAX_FONT_SCALE, DEFAULT_FONT_SCALE, FONT_SCALE_STEP } from '@/shared/utils/css'
import styles from './SettingsFontSize.module.scss'

export default function SettingsFontSize() {
  const fontScale = useThemeStore((state) => state.fontScale)
  const setFontScale = useThemeStore((state) => state.setFontScale)
  const resetFontScale = useThemeStore((state) => state.resetFontScale)

  const isDefault = fontScale === DEFAULT_FONT_SCALE

  return (
    <SettingsSection
      title="حجم الخط"
      description="تحكم في حجم النصوص في جميع أنحاء التطبيق"
      icon={IconTextSize}
      actions={
        !isDefault && (
          <button
            type="button"
            className="btn btn-sm btn-flat d-inline-flex align-items-center gap-1"
            onClick={resetFontScale}
          >
            <IconRotate size={15} />
            <span>إعادة تعيين</span>
          </button>
        )
      }
    >
      <div className="p-3 border rounded">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className={styles.step}
            disabled={fontScale <= MIN_FONT_SCALE}
            aria-label="تصغير الخط"
            onClick={() => setFontScale(fontScale - FONT_SCALE_STEP)}
          >
            <span className={styles.stepSmall}>أ</span>
          </button>

          <input
            value={fontScale}
            onChange={(event) => setFontScale(Number(event.target.value))}
            className="form-range flex-grow-1"
            type="range"
            min={MIN_FONT_SCALE}
            max={MAX_FONT_SCALE}
            step={FONT_SCALE_STEP}
            aria-label="حجم الخط"
          />

          <button
            type="button"
            className={styles.step}
            disabled={fontScale >= MAX_FONT_SCALE}
            aria-label="تكبير الخط"
            onClick={() => setFontScale(fontScale + FONT_SCALE_STEP)}
          >
            <span className={styles.stepLarge}>أ</span>
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-muted">صغير</small>
          <small className="fw-medium">{toArabicNumerals(fontScale)}٪</small>
          <small className="text-muted">كبير</small>
        </div>

        <p className={`${styles.preview} mb-0 mt-3`}>إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>
      </div>
    </SettingsSection>
  )
}
