import { useMemo } from 'react'

import LoadingState from '@/shared/ui/LoadingState'
import ErrorState from '@/shared/ui/ErrorState'
import OfflineState from '@/shared/ui/OfflineState'
import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon'
import { usePrayersStore, selectCalculationParams, selectHasLocation } from '@/features/prayers/store'
import { usePrayerLocation } from '@/features/prayers/hooks/usePrayerLocation'
import { useJsonFetch } from '@/shared/hooks/useJsonFetch'
import { useNow } from '@/shared/hooks/useNow'
import { useOnline } from '@/shared/hooks/useOnline'
import { useReconnectExecute } from '@/shared/hooks/useReconnectExecute'
import { formatTime, toArabicNumerals } from '@/shared/utils/arabic'
import { formatClockTime } from '@/shared/utils/format'
import { API } from '@/shared/constants/api'
import { formatAladhanDate } from '@/features/prayers/lib/date'
import styles from './PrayerTimes.module.scss'

const TIMINGS = {
  Fajr: { label: 'الفجر', icon: 'fajr' },
  Sunrise: { label: 'الشروق', icon: 'sunrise' },
  Dhuhr: { label: 'الظهر', icon: 'dhuhr' },
  Asr: { label: 'العصر', icon: 'asr' },
  Maghrib: { label: 'المغرب', icon: 'maghrib' },
  Isha: { label: 'العشاء', icon: 'isha' },
}

const TIMING_KEYS = Object.keys(TIMINGS)

function buildEndpoint(latitude, longitude, calculationParams) {
  if (!latitude || !longitude) return null

  const today = formatAladhanDate()
  const params = new URLSearchParams({ latitude, longitude, iso8601: 'true' })

  return `${API.aladhan}/timings/${today}?${params.toString()}${calculationParams ? `&${calculationParams}` : ''}`
}

// The prayer that comes next, wrapping around to Fajr after Isha.
function findNextPrayer(timings, now) {
  if (!timings) return null

  const prayers = TIMING_KEYS.map((name) => ({ name, time: new Date(timings[name]).getTime() }))

  for (let index = 0; index < prayers.length - 1; index++) {
    if (now >= prayers[index].time && now < prayers[index + 1].time) return prayers[index + 1].name
  }

  const [first] = prayers
  const last = prayers[prayers.length - 1]

  return now >= last.time || now < first.time ? first.name : null
}

export default function PrayerTimes({ lat = null, long = null, vertical = false, className = '' }) {
  const hasPropsCoords = lat != null && long != null

  const now = useNow()
  const online = useOnline()

  const storeLatitude = usePrayersStore((state) => state.latitude)
  const storeLongitude = usePrayersStore((state) => state.longitude)
  const isDetecting = usePrayersStore((state) => state.isDetecting)
  const hasLocation = usePrayersStore(selectHasLocation)
  const calculationParams = usePrayersStore(selectCalculationParams)

  const { detect } = usePrayerLocation()

  const latitude = hasPropsCoords ? lat : storeLatitude
  const longitude = hasPropsCoords ? long : storeLongitude

  const endpoint = buildEndpoint(latitude, longitude, calculationParams)
  const { data: timings, error, pending: isFetching, execute } = useJsonFetch(endpoint)
  const { isRecoveringOnReconnect } = useReconnectExecute(execute)

  const prayerTimes = timings?.data?.timings
  const nextPrayerKey = useMemo(() => findNextPrayer(prayerTimes, now.getTime()), [prayerTimes, now])

  const hijri = timings?.data?.date?.hijri
  const hijriDate = hijri ? toArabicNumerals(`${hijri.day} ${hijri.month.ar} ${hijri.year}`) : ''
  const hijriDay = hijri?.weekday?.ar ?? ''

  const remainingTime = useMemo(() => {
    if (!prayerTimes || !nextPrayerKey) return null

    const nextPrayerTime = new Date(prayerTimes[nextPrayerKey])
    // A next prayer that already passed belongs to tomorrow.
    if (nextPrayerTime < now) nextPrayerTime.setDate(nextPrayerTime.getDate() + 1)

    return formatTime((nextPrayerTime - now) / 1000)
  }, [prayerTimes, nextPrayerKey, now])

  if (!hasPropsCoords && isDetecting) {
    return (
      <div className={`${styles.state} border rounded p-5 ${className}`}>
        <LoadingState message="جاري تحديد موقعك..." />
      </div>
    )
  }

  if (!hasPropsCoords && !hasLocation) {
    return (
      <button
        type="button"
        className={`${styles.state} ${styles.detectButton} w-100 border rounded p-5 text-center ${className}`}
        onClick={detect}
      >
        اضغط هنا لتحديد الموقع الخاص بك وعرض مواقيت الصلاة
      </button>
    )
  }

  if (isFetching || isRecoveringOnReconnect) {
    return (
      <div className={`${styles.state} border rounded p-5 ${className}`}>
        <LoadingState message="جاري تحميل مواقيت الصلاة..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.state} border rounded p-5 ${className}`}>
        {online ? (
          <ErrorState code={500} message="حدث خطأ أثناء تحميل البيانات، برجاء المحاولة في وقت لاحق." />
        ) : (
          <OfflineState />
        )}
      </div>
    )
  }

  if (!prayerTimes) return null

  return (
    <div className={`d-flex flex-column gap-2 ${className}`}>
      <div className={`${styles.header} d-flex align-items-center justify-content-between p-3 rounded text-white`}>
        <div>
          <div className={`d-flex align-items-center gap-2 small ${styles.soft}`}>
            <span className={`icon-circle ${styles.headerIcon}`}>
              {nextPrayerKey && <PrayerIcon name={TIMINGS[nextPrayerKey].icon} />}
            </span>
            {nextPrayerKey && <span>الصلاة القادمة · {TIMINGS[nextPrayerKey].label}</span>}
          </div>
          <div className="fs-4 fw-bold mt-1">{remainingTime}</div>
        </div>
        <div className="text-end">
          <div className="mb-1 fw-semibold">{hijriDay}</div>
          <small className={styles.soft}>{hijriDate}</small>
        </div>
      </div>

      {vertical ? (
        <div className="d-flex flex-column gap-1">
          {TIMING_KEYS.map((key) => (
            <div
              key={key}
              className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-2 small border ${
                key === nextPrayerKey ? styles.nextRow : ''
              }`}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`${styles.iconContainer} ${key === nextPrayerKey ? 'text-primary' : 'text-secondary'}`}
                >
                  <PrayerIcon name={TIMINGS[key].icon} />
                </span>
                <span className="fw-semibold">{TIMINGS[key].label}</span>
              </div>
              <span className="fw-semibold">{formatClockTime(prayerTimes[key])}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-2">
          {TIMING_KEYS.map((key) => (
            <div key={key} className="col">
              <div className={`card h-100 ${styles.card} ${key === nextPrayerKey ? styles.nextCard : ''}`}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2 p-3">
                  <span
                    className={`icon-circle ${key === nextPrayerKey ? 'border-primary text-primary' : 'text-secondary'}`}
                  >
                    <PrayerIcon name={TIMINGS[key].icon} />
                  </span>
                  <div>
                    <div className={`small fw-semibold mb-1 ${key === nextPrayerKey ? '' : 'text-body-secondary'}`}>
                      {TIMINGS[key].label}
                    </div>
                    <div className="fs-5 fw-bold lh-1">{formatClockTime(prayerTimes[key])}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
