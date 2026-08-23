import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './CircleProgress.module.scss'

export default function CircleProgress({ percentage, size = 56, className = '' }) {
  return (
    <div className={`${styles.circleProgress} ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <svg viewBox="0 0 36 36">
        <circle className={styles.ringBg} cx="18" cy="18" r="15.9155" />
        <circle className={styles.ringFill} cx="18" cy="18" r="15.9155" strokeDasharray={`${percentage} 100`} />
      </svg>
      <span className={styles.ringText}>{toArabicNumerals(percentage)}%</span>
    </div>
  )
}
