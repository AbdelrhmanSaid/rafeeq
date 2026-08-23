import { IconCompass } from '@tabler/icons-react'

import { needleRotation, isFacingQibla } from '@/features/qibla/lib/qibla'
import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './QiblaCompass.module.scss'

// 15° tolerance allows natural hand movement while staying precise for prayer.
const FACING_TOLERANCE = 15

export default function QiblaCompass({
  qiblaDirection,
  heading = 0,
  hasCompassSupport = false,
  compassError = null,
  onRequestPermission,
  canRequestPermission = false,
}) {
  const rotation = needleRotation(qiblaDirection, heading)
  const facingQibla = hasCompassSupport && isFacingQibla(rotation, FACING_TOLERANCE)

  return (
    <div className={styles.shell}>
      <div className={`${styles.compass} ${facingQibla ? styles.facingQibla : ''}`}>
        {/* Qibla needle - points to Qibla direction */}
        <div className={styles.needle} style={{ transform: `rotate(${rotation}deg)` }}>
          <div className={styles.needlePointer}></div>
          <div className={styles.kaaba}>🕋</div>
        </div>

        <div className={styles.centerDot}></div>

        <div className={styles.youIndicator}>
          <span>أنت</span>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.degree}>
          <IconCompass size="1.25rem" className="me-2" />
          <span>{toArabicNumerals(qiblaDirection.toFixed(1))}° من الشمال</span>
        </div>
        <p className={styles.hint}>
          {hasCompassSupport && !compassError ? (
            facingQibla ? (
              <span className="text-success fw-bold">أنت تواجه القبلة!</span>
            ) : (
              <span>أدر هاتفك حتى تشير الكعبة للأعلى</span>
            )
          ) : (
            <span className="text-warning">{compassError || 'البوصلة غير متاحة'}</span>
          )}
        </p>
      </div>

      {canRequestPermission && (
        <button className="btn btn-primary" onClick={onRequestPermission}>
          <IconCompass className="me-2" size="1.25rem" />
          تفعيل البوصلة
        </button>
      )}
    </div>
  )
}
