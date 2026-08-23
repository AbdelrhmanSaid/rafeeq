import { useState } from 'react'
import { IconRefreshDot } from '@tabler/icons-react'

import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './Sebha.module.scss'

export default function Sebha() {
  const [count, setCount] = useState(0)

  return (
    <div className={styles.shell}>
      <button onClick={() => setCount((value) => value + 1)} className={styles.button}>
        <span className={styles.count}>{toArabicNumerals(count)}</span>
        <span className={styles.label}>اضغط للتسبيح</span>
      </button>

      <div className={styles.actions}>
        <button onClick={() => setCount(0)} className="btn btn-flat">
          <IconRefreshDot className="me-2" size="1.25rem" />
          <span>إعادة العداد</span>
        </button>
        <span className={styles.hint}>استمر بالذكر، واحتسب الأجر</span>
      </div>
    </div>
  )
}
