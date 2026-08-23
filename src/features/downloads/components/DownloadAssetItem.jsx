import { IconBook2, IconSparkles, IconCheck, IconLoader2, IconDownload, IconAlertTriangle } from '@tabler/icons-react'

import styles from './DownloadAssetItem.module.scss'

// One downloadable asset row. `asset.status` is one of:
// 'downloaded' | 'downloading' | 'queued' | 'failed' | 'not-downloaded'.
const STATUS_CLASS = {
  'downloaded': styles.downloaded,
  'downloading': styles.downloading,
  'queued': styles.queued,
  'failed': styles.failed,
  'not-downloaded': styles.notDownloaded,
}

const ACTION_LABEL = {
  'downloaded': 'حذف الملف',
  'downloading': 'جاري التحميل',
  'queued': 'إزالة من قائمة الانتظار',
  'failed': 'فشل التحميل، إعادة المحاولة',
  'not-downloaded': 'تحميل الملف',
}

function StatusIcon({ status }) {
  if (status === 'downloaded') return <IconCheck size={16} />
  if (status === 'downloading') return <IconLoader2 size={16} className={styles.spin} />
  if (status === 'queued') return <span className={styles.queuedDot}></span>
  if (status === 'failed') return <IconAlertTriangle size={16} />

  return <IconDownload size={16} />
}

export default function DownloadAssetItem({ asset, online = true, onAction }) {
  const isSurah = asset.type === 'surah'

  return (
    <div className={`${styles.item} ${STATUS_CLASS[asset.status]}`}>
      <div className={`${styles.itemIcon} ${isSurah ? styles.surah : styles.azkar}`}>
        {isSurah ? <IconBook2 size={18} /> : <IconSparkles size={18} />}
      </div>

      <div className={styles.itemInfo}>
        <span className={styles.itemName}>{asset.name}</span>
        <span className={styles.itemType}>{isSurah ? 'سورة' : 'أذكار'}</span>
      </div>

      <button
        className={`${styles.itemAction} ${STATUS_CLASS[asset.status]}`}
        onClick={() => onAction(asset)}
        disabled={asset.status === 'downloading' || (!online && ['not-downloaded', 'failed'].includes(asset.status))}
        aria-label={ACTION_LABEL[asset.status]}
        title={asset.status === 'failed' ? 'فشل التحميل، اضغط لإعادة المحاولة' : undefined}
      >
        <StatusIcon status={asset.status} />
      </button>
    </div>
  )
}
