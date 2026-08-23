import PrayerIcon from '@/features/prayers/components/icons/PrayerIcon'
import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './SunnahPrayers.module.scss'

const PRAYERS = [
  { name: 'الفجر', before: 2, after: 0, icon: 'fajr' },
  { name: 'الظهر', before: 4, after: 4, icon: 'dhuhr' },
  { name: 'العصر', before: 0, after: 0, icon: 'asr' },
  { name: 'المغرب', before: 0, after: 2, icon: 'maghrib' },
  { name: 'العشاء', before: 0, after: 2, icon: 'isha' },
]

const formatRakaa = (value) => {
  if (value === 0) return '—'
  if (value === 2) return 'ركعتان'
  return `${toArabicNumerals(value)} ركعات`
}

const mutedWhenNone = (value) => (value === 0 ? 'text-body-secondary' : '')

export default function SunnahPrayers({ className = '' }) {
  return (
    <div className={className}>
      {/* List layout (below lg) */}
      <div className="d-lg-none">
        <div className="d-flex justify-content-end px-3 pb-1 small text-body-secondary">
          <span className={styles.rakaaColumn}>قبل</span>
          <span className={styles.rakaaColumn}>بعد</span>
        </div>
        <div className="d-flex flex-column gap-1">
          {PRAYERS.map((prayer) => (
            <div
              key={prayer.name}
              className="d-flex align-items-center justify-content-between px-3 py-2 rounded-2 small border"
            >
              <div className="d-flex align-items-center gap-2">
                <span className={`${styles.iconContainer} text-secondary`}>
                  <PrayerIcon name={prayer.icon} />
                </span>
                <span className="fw-semibold">{prayer.name}</span>
              </div>
              <div className="d-flex">
                <span className={`${styles.rakaaColumn} fw-semibold ${mutedWhenNone(prayer.before)}`}>
                  {formatRakaa(prayer.before)}
                </span>
                <span className={`${styles.rakaaColumn} fw-semibold ${mutedWhenNone(prayer.after)}`}>
                  {formatRakaa(prayer.after)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards layout (lg and up) */}
      <div className="d-none d-lg-flex row row-cols-lg-5 g-2">
        {PRAYERS.map((prayer) => (
          <div key={prayer.name} className="col">
            <div className="card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="icon-circle text-secondary">
                    <PrayerIcon name={prayer.icon} />
                  </span>
                  <h3 className="card-title mb-0 fs-6 fw-semibold">{prayer.name}</h3>
                </div>

                <div className="row g-0 text-center small">
                  <div className="col-6 pe-2">
                    <div className="text-body-secondary mb-1">قبل</div>
                    <div className={`fw-semibold ${mutedWhenNone(prayer.before)}`}>{formatRakaa(prayer.before)}</div>
                  </div>
                  <div className="col-6 ps-2 border-start">
                    <div className="text-body-secondary mb-1">بعد</div>
                    <div className={`fw-semibold ${mutedWhenNone(prayer.after)}`}>{formatRakaa(prayer.after)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
