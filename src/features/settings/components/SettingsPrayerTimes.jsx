import {
  IconRefreshDot,
  IconTrash,
  IconLayoutList,
  IconLayoutGrid,
  IconDevices,
  IconClockHour4,
} from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import { usePrayersStore, selectHasLocation } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/hooks/usePrayerLocation'
import { CALCULATION_FIELDS } from '@/features/prayers/constants/calculationOptions'

const LAYOUTS = [
  { value: 'cards', label: 'بطاقات', icon: IconLayoutGrid },
  { value: 'list', label: 'قائمة', icon: IconLayoutList },
  { value: 'auto', label: 'تلقائي', icon: IconDevices },
]

export default function SettingsPrayerTimes() {
  const latitude = usePrayersStore((state) => state.latitude)
  const longitude = usePrayersStore((state) => state.longitude)
  const hasLocation = usePrayersStore(selectHasLocation)
  const currentLayout = usePrayersStore((state) => state.layout)
  const setLayout = usePrayersStore((state) => state.setLayout)
  const setCalculationField = usePrayersStore((state) => state.setCalculationField)
  const clear = usePrayersStore((state) => state.clear)
  const { detect } = usePrayerLocation()

  const location = hasLocation ? `${latitude}, ${longitude}` : 'لم يتم تحديد الموقع'

  return (
    <SettingsSection title="مواقيت الصلاة" description="حدّد موقعك وطريقة عرض المواقيت" icon={IconClockHour4}>
      <div className="mb-3">
        <span className="d-block mb-2">طريقة العرض</span>
        <div className="btn-group-toggle">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.value}
              className={`btn-toggle ${currentLayout === layout.value ? 'active' : ''}`}
              onClick={() => setLayout(layout.value)}
            >
              <layout.icon size={16} />
              <span>{layout.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="input-group">
          <div className="form-floating">
            <input id="location" type="text" className="form-control" value={location} readOnly />
            <label htmlFor="location">الموقع</label>
          </div>

          <button type="button" className="input-group-text" onClick={detect} aria-label="تحديد الموقع">
            <IconRefreshDot size="1.25rem" />
          </button>

          <button type="button" className="input-group-text" onClick={clear} aria-label="مسح الموقع">
            <IconTrash size="1.25rem" />
          </button>
        </div>
      </div>

      {CALCULATION_FIELDS.map((field) => (
        <CalculationField key={field.key} field={field} onChange={setCalculationField} />
      ))}
    </SettingsSection>
  )
}

// Own component so each select subscribes to just its field.
function CalculationField({ field, onChange }) {
  const value = usePrayersStore((state) => state[field.key])

  return (
    <div className="mb-3">
      <div className="form-floating">
        <select
          id={field.key}
          className="form-select"
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={field.key}>{field.label}</label>
      </div>
    </div>
  )
}
