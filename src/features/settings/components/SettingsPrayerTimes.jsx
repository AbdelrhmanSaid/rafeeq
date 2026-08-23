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
  const store = usePrayersStore()
  const { detect } = usePrayerLocation()

  const location = selectHasLocation(store) ? `${store.latitude}, ${store.longitude}` : 'لم يتم تحديد الموقع'

  return (
    <SettingsSection title="مواقيت الصلاة" description="حدّد موقعك وطريقة عرض المواقيت" icon={IconClockHour4}>
      <div className="mb-3">
        <span className="d-block mb-2">طريقة العرض</span>
        <div className="btn-group-toggle">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.value}
              className={`btn-toggle ${store.layout === layout.value ? 'active' : ''}`}
              onClick={() => store.setLayout(layout.value)}
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

          <button type="button" className="input-group-text" onClick={store.clear} aria-label="مسح الموقع">
            <IconTrash size="1.25rem" />
          </button>
        </div>
      </div>

      {CALCULATION_FIELDS.map((field) => (
        <div key={field.key} className="mb-3">
          <div className="form-floating">
            <select
              id={field.key}
              className="form-select"
              value={store[field.key]}
              onChange={(event) => store.setCalculationField(field.key, event.target.value)}
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
      ))}
    </SettingsSection>
  )
}
