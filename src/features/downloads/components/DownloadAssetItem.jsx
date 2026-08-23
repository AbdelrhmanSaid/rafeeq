import { IconBook2, IconSparkles, IconCheck, IconLoader2, IconDownload } from '@tabler/icons-react'

import styles from './DownloadAssetItem.module.scss'

// One downloadable asset row. `asset.status` is one of:
// 'downloaded' | 'downloading' | 'queued' | 'not-downloaded'.
const STATUS_CLASS = {
  'downloaded': styles.downloaded,
  'downloading': styles.downloading,
  'queued': styles.queued,
  'not-downloaded': styles.notDownloaded,
}

function StatusIcon({ status }) {
  if (status === 'downloaded') return <IconCheck size={16} />
  if (status === 'downloading') return <IconLoader2 size={16} className={styles.spin} />
  if (status === 'queued') return <span className={styles.queuedDot}></span>

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
        disabled={asset.status === 'downloading' || (!online && asset.status === 'not-downloaded')}
        aria-label={asset.status === 'downloaded' ? 'حذف الملف' : 'تحميل الملف'}
      >
        <StatusIcon status={asset.status} />
      </button>
    </div>
  )
}
