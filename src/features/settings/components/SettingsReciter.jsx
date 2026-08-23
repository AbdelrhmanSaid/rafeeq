import { useMemo } from 'react'
import { IconMicrophone2 } from '@tabler/icons-react'

import SettingsSection from './SettingsSection'
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore, selectReciter } from '@/features/quran/store'

const collapseSpaces = (value) => value.replace(/\s+/g, ' ')

// Only reciters with a complete mushaf can be used for surah playback.
const fullReciters = reciters
  .filter((reciter) => reciter.soar_count >= 114)
  .map((reciter) => ({ ...reciter, rewaya: collapseSpaces(reciter.rewaya) }))

const rewayat = [...new Set(fullReciters.map((reciter) => reciter.rewaya))]

export default function SettingsReciter() {
  const currentReciter = useQuranStore((state) => state.currentReciter)
  const changeReciter = useQuranStore((state) => state.changeReciter)
  const reciter = useQuranStore(selectReciter)

  const currentRewaya = collapseSpaces(reciter?.rewaya ?? '') || rewayat[0]
  const filteredReciters = useMemo(() => fullReciters.filter((item) => item.rewaya === currentRewaya), [currentRewaya])

  // Switching rewaya moves to its first reciter, since the current one belongs
  // to the rewaya being left behind.
  const onRewayaChange = (rewaya) => {
    const first = fullReciters.find((item) => item.rewaya === rewaya)
    if (first) changeReciter(first.id)
  }

  return (
    <SettingsSection title="القرآن الكريم" description="اختر الرواية والقارئ المفضل لديك" icon={IconMicrophone2}>
      <div className="mb-3">
        <div className="form-floating">
          <select
            className="form-select"
            id="currentRewaya"
            value={currentRewaya}
            onChange={(event) => onRewayaChange(event.target.value)}
          >
            {rewayat.map((rewaya) => (
              <option key={rewaya} value={rewaya}>
                {rewaya}
              </option>
            ))}
          </select>
          <label htmlFor="currentRewaya">الرواية</label>
        </div>
      </div>

      <div>
        <div className="form-floating">
          <select
            className="form-select"
            id="currentReciter"
            value={Number(currentReciter)}
            onChange={(event) => changeReciter(Number(event.target.value))}
          >
            {filteredReciters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <label htmlFor="currentReciter">القارئ الحالي</label>
        </div>
      </div>
    </SettingsSection>
  )
}
