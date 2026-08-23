import { IconCheck, IconSunFilled, IconMoonStars, IconDeviceLaptop, IconPalette } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import { useThemeStore } from '@/app/stores/theme'
import styles from './SettingsTheme.module.scss'

const MODES = [
  { value: 'light', label: 'فاتح', icon: IconSunFilled },
  { value: 'dark', label: 'داكن', icon: IconMoonStars },
  { value: 'system', label: 'تلقائي', icon: IconDeviceLaptop },
]

const COLORS = [
  { label: 'الافتراضي', value: '' },
  { label: 'أخضر', value: '#1B5E20' },
  { label: 'فيروزي', value: '#00897B' },
  { label: 'أزرق', value: '#1565C0' },
  { label: 'كحلي', value: '#0D47A1' },
  { label: 'رملي', value: '#C2A878' },
]

const DEFAULT_COLOR = '#795547'

export default function SettingsTheme() {
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  const primaryColor = useThemeStore((state) => state.primaryColor)
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor)

  return (
    <SettingsSection title="المظهر" description="اختر وضع العرض واللون الأساسي للتطبيق" icon={IconPalette}>
      <div className="btn-group-toggle mb-3">
        {MODES.map((option) => (
          <button
            key={option.value}
            className={`btn-toggle ${mode === option.value ? 'active' : ''}`}
            onClick={() => setMode(option.value)}
          >
            <option.icon size={16} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <div>
        <span className="d-block mb-2">اللون الأساسي</span>
        <div className={styles.colorGrid}>
          {COLORS.map((color) => (
            <button
              key={color.value}
              className={`${styles.colorOption} ${primaryColor === color.value ? styles.active : ''}`}
              onClick={() => setPrimaryColor(color.value)}
            >
              <span className={styles.colorDot} style={{ background: color.value || DEFAULT_COLOR }}>
                {primaryColor === color.value && <IconCheck size={14} />}
              </span>
              <span className={styles.colorLabel}>{color.label}</span>
            </button>
          ))}
        </div>
      </div>
    </SettingsSection>
  )
}
