import { useMemo, useState } from 'react'
import {
  IconDownload,
  IconTrash,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
  IconCheck,
  IconLoader2,
  IconWifiOff,
  IconBook2,
  IconSparkles,
  IconCloudDownload,
} from '@tabler/icons-react'
import { toast } from 'sonner'

import DownloadAssetItem from '@/features/downloads/components/DownloadAssetItem'
import CircleProgress from '@/shared/ui/CircleProgress'
import {
  useDownloadStore,
  selectDownloadedCount,
  selectIsCompleted,
  selectProgressPercentage,
  ALL_ASSETS,
  TOTAL_ASSETS,
} from '@/features/downloads/store'
import { useOnline } from '@/shared/hooks/useOnline'
import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './SettingsDownloadAssets.module.scss'

const FILTERS = [
  { value: 'all', label: 'الكل', icon: null },
  { value: 'surah', label: 'السور', icon: IconBook2 },
  { value: 'azkar', label: 'الأذكار', icon: IconSparkles },
]

const COUNT_BY_TYPE = {
  all: TOTAL_ASSETS,
  surah: ALL_ASSETS.filter((asset) => asset.type === 'surah').length,
  azkar: ALL_ASSETS.filter((asset) => asset.type === 'azkar').length,
}

function statusOf(asset, downloadedKeys, currentItem, queue) {
  if (downloadedKeys[asset.type].includes(asset.key)) return 'downloaded'
  if (currentItem?.id === asset.id) return 'downloading'
  if (queue.some((item) => item.id === asset.id)) return 'queued'

  return 'not-downloaded'
}

export default function SettingsDownloadAssets() {
  const online = useOnline()

  const downloadedKeys = useDownloadStore((state) => state.downloadedKeys)
  const queue = useDownloadStore((state) => state.queue)
  const currentItem = useDownloadStore((state) => state.currentItem)
  const isDownloading = useDownloadStore((state) => state.isDownloading)
  const isPaused = useDownloadStore((state) => state.isPaused)

  const downloadedCount = useDownloadStore(selectDownloadedCount)
  const progressPercentage = useDownloadStore(selectProgressPercentage)
  const isCompleted = useDownloadStore(selectIsCompleted)

  const [filterType, setFilterType] = useState('all')

  const filteredAssets = useMemo(
    () =>
      ALL_ASSETS.filter((asset) => filterType === 'all' || asset.type === filterType).map((asset) => ({
        ...asset,
        status: statusOf(asset, downloadedKeys, currentItem, queue),
      })),
    [filterType, downloadedKeys, currentItem, queue],
  )

  const handleRemoveAll = () => {
    const { cancelAllDownloads, removeAllAssets } = useDownloadStore.getState()
    cancelAllDownloads()

    toast.warning('سيتم حذف جميع الملفات، متأكد؟', {
      position: 'bottom-center',
      duration: Infinity,
      action: {
        label: 'تأكيد الحذف',
        onClick: () => removeAllAssets(),
      },
    })
  }

  const handleAssetAction = (asset) => {
    const { removeAsset, removeFromQueue, queueAsset } = useDownloadStore.getState()

    if (asset.status === 'downloaded') removeAsset(asset)
    else if (asset.status === 'queued') removeFromQueue(asset)
    else if (asset.status === 'not-downloaded') queueAsset(asset)
  }

  return (
    <div className={styles.manager}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.title}>
            <span className={styles.titleIcon}>
              <IconCloudDownload size={20} />
            </span>
            <div>
              <h3>التنزيلات</h3>
              <p>للاستخدام بدون إنترنت</p>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statsText}>
              <span className={styles.statsCount}>
                {toArabicNumerals(downloadedCount)}/{toArabicNumerals(TOTAL_ASSETS)}
              </span>
              <span className={styles.statsLabel}>ملف محمّل</span>
            </div>
            <CircleProgress className="d-none d-md-block" percentage={progressPercentage} />
          </div>
        </div>

        {(isDownloading || isPaused || !online) && (
          <div className={styles.statusBar}>
            {!online ? (
              <>
                <IconWifiOff size={16} />
                <span>لا يوجد اتصال بالإنترنت</span>
              </>
            ) : isDownloading && currentItem ? (
              <>
                <IconLoader2 size={16} className={styles.spin} />
                <span>جاري تحميل: {currentItem.name}</span>
                <span className={styles.statusRemaining}>{toArabicNumerals(queue.length)} متبقي</span>
              </>
            ) : (
              isPaused && (
                <>
                  <IconPlayerPause size={16} />
                  <span>التحميل متوقف مؤقتاً</span>
                </>
              )
            )}
          </div>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`${styles.filterButton} ${filterType === filter.value ? styles.active : ''}`}
              onClick={() => setFilterType(filter.value)}
            >
              {filter.icon && <filter.icon size={14} />}
              {filter.label}
              <span className={styles.filterCount}>{toArabicNumerals(COUNT_BY_TYPE[filter.value])}</span>
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {(isDownloading || isPaused) && (
            <button
              className={styles.actionButton}
              onClick={() =>
                isPaused ? useDownloadStore.getState().resumeDownloads() : useDownloadStore.getState().pauseDownloads()
              }
              aria-label={isPaused ? 'استئناف التحميل' : 'إيقاف التحميل مؤقتاً'}
            >
              {isPaused ? <IconPlayerPlay size={16} /> : <IconPlayerPause size={16} />}
            </button>
          )}

          {queue.length > 0 && (
            <button
              className={styles.actionButton}
              onClick={() => useDownloadStore.getState().cancelAllDownloads()}
              title="إلغاء"
            >
              <IconX size={16} />
            </button>
          )}

          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={handleRemoveAll}
            disabled={isDownloading || downloadedCount === 0}
            title="حذف الكل"
          >
            <IconTrash size={16} />
          </button>

          <button
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={() => useDownloadStore.getState().queueAllAssets()}
            disabled={isDownloading || !online || isCompleted}
          >
            <IconDownload size={16} />
            <span>تحميل الكل</span>
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {filteredAssets.map((asset) => (
          <DownloadAssetItem key={asset.id} asset={asset} online={online} onAction={handleAssetAction} />
        ))}
      </div>

      {isCompleted && (
        <div className={styles.completed}>
          <IconCheck size={20} />
          <span>تم تحميل جميع الملفات بنجاح!</span>
        </div>
      )}
    </div>
  )
}
