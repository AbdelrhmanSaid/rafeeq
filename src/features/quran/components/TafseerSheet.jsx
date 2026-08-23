import { useState } from 'react'
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react'

import BottomSheet from '@/shared/ui/BottomSheet'
import LoadingState from '@/shared/ui/LoadingState'
import ErrorState from '@/shared/ui/ErrorState'
import OfflineState from '@/shared/ui/OfflineState'
import tafseers from '@/features/quran/data/tafseers.js'
import { useQuranStore } from '@/features/quran/store'
import { useJsonFetch } from '@/shared/hooks/useJsonFetch'
import { useOnline } from '@/shared/hooks/useOnline'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { API } from '@/shared/constants/api'

// `show` is separate from `ayah` so the sheet keeps rendering the ayah while it
// animates closed.
export default function TafseerSheet({
  show = false,
  ayah = null,
  hasPrev = false,
  hasNext = false,
  onClose,
  onPrev,
  onNext,
}) {
  const online = useOnline()
  const defaultTafseer = useQuranStore((state) => state.currentTafseer)

  // Seeds from the saved default, but lets the user switch edition just for this
  // sheet — picking here never writes back to the stored default.
  const [edition, setEdition] = useState(defaultTafseer)

  const url = ayah ? `${API.quranCloud}/ayah/${ayah.number}/editions/${edition}` : null
  const { data, error, pending: isFetching } = useJsonFetch(url, { enabled: online })

  const tafsir = data?.data?.[0]

  return (
    <BottomSheet show={show} title="تفسير الآية" onClose={onClose}>
      <div className="p-4">
        {ayah && (
          <>
            <p className="fs-3 text-center lh-lg font-quran mb-4">
              {ayah.text} <span className="ayah-number">{toArabicNumerals(ayah.numberInSurah)}</span>
            </p>

            <div className="form-floating mb-4">
              <select
                id="tafseerEdition"
                value={edition}
                onChange={(event) => setEdition(event.target.value)}
                className="form-select"
              >
                {tafseers.map((tafseer) => (
                  <option key={tafseer.identifier} value={tafseer.identifier}>
                    {tafseer.name}
                  </option>
                ))}
              </select>
              <label htmlFor="tafseerEdition">التفسير</label>
            </div>
          </>
        )}

        {isFetching ? (
          <LoadingState message="جاري تحميل التفسير..." />
        ) : !online && !tafsir ? (
          <OfflineState />
        ) : error ? (
          <ErrorState code={500} message="حدث خطأ أثناء تحميل التفسير، برجاء المحاولة مرة أخرى." />
        ) : (
          ayah &&
          tafsir && (
            <>
              <p className="mb-0">{tafsir.text}</p>

              <div className="d-flex justify-content-between gap-2 mt-4 pt-3 border-top">
                <button className="btn btn-flat d-flex align-items-center gap-1" disabled={!hasPrev} onClick={onPrev}>
                  <IconChevronRight size="18" />
                  <span>الآية السابقة</span>
                </button>

                <button className="btn btn-flat d-flex align-items-center gap-1" disabled={!hasNext} onClick={onNext}>
                  <span>الآية التالية</span>
                  <IconChevronLeft size="18" />
                </button>
              </div>
            </>
          )
        )}
      </div>
    </BottomSheet>
  )
}
