import { IconBook } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import tafseers from '@/features/quran/data/tafseers.js'
import { useQuranStore } from '@/features/quran/store'

export default function SettingsTafseer() {
  const currentTafseer = useQuranStore((state) => state.currentTafseer)
  const setCurrentTafseer = useQuranStore((state) => state.setCurrentTafseer)

  return (
    <SettingsSection title="التفسير" description="اختر التفسير الافتراضي للآيات" icon={IconBook}>
      <div className="form-floating">
        <select
          id="currentTafseer"
          value={currentTafseer}
          onChange={(event) => setCurrentTafseer(event.target.value)}
          className="form-select"
        >
          {tafseers.map((tafseer) => (
            <option key={tafseer.identifier} value={tafseer.identifier}>
              {tafseer.name}
            </option>
          ))}
        </select>
        <label htmlFor="currentTafseer">التفسير الافتراضي</label>
      </div>
    </SettingsSection>
  )
}
