import { IconHeart, IconHeartFilled, IconPlayerPause, IconPlayerPlay, IconShare3, IconRadio } from '@tabler/icons-react'

import BackButton from '@/shared/ui/BackButton'
import { ROUTES } from '@/app/router/routes'
import styles from './RadioPlayer.module.scss'

const WAVES = [1, 2, 3]

export default function RadioPlayer({
  station,
  isPlaying = false,
  isFavorite = false,
  canShare = false,
  onToggle,
  onFavorite,
  onShare,
}) {
  return (
    <div className="position-relative w-100 mx-auto" style={{ maxWidth: '500px' }}>
      {/* Navigation Header */}
      <div className="d-flex justify-content-between mb-4 position-relative z-1 embed-hidden">
        <BackButton to={ROUTES.radio} />

        {canShare && (
          <button className="btn btn-flat" type="button" onClick={onShare}>
            <IconShare3 size="1.25rem" className="me-2" />
            <span>مشاركة</span>
          </button>
        )}
      </div>

      {/* Player Content */}
      <div className="d-flex flex-column align-items-center text-center position-relative z-1">
        {/* Vinyl/Disc Animation */}
        <div
          className={`${styles.discContainer} mb-5 position-relative d-flex align-items-center justify-content-center`}
        >
          <div className={`${styles.disc} ${isPlaying ? styles.spinning : ''}`}>
            <div className={styles.discInner}>
              <div className={styles.discLabel}>
                <IconRadio size="2rem" />
              </div>
            </div>
            <div className={styles.discGrooves}></div>
          </div>

          {/* Sound Waves */}
          <div className={`${styles.soundWaves} ${isPlaying ? styles.active : ''}`}>
            {WAVES.map((index) => (
              <span key={index} className={styles.wave} style={{ '--index': index }}></span>
            ))}
          </div>
        </div>

        {/* Station Info */}
        <div className="mb-5">
          <h1 className="h2 fw-bold mb-2">{station.name}</h1>
          <p className="d-inline-flex align-items-center gap-2 small text-secondary m-0">
            <span className={`${styles.statusDot} ${isPlaying ? styles.live : ''}`}></span>
            {isPlaying ? 'البث المباشر جارٍ الآن' : 'جاهز للتشغيل'}
          </p>
        </div>

        {/* Controls */}
        <div className="d-flex flex-column align-items-center gap-4 mb-4 w-100">
          <button
            className={`${styles.playButton} ${isPlaying ? 'bg-danger' : 'bg-primary'}`}
            type="button"
            onClick={onToggle}
            aria-label={isPlaying ? 'إيقاف البث' : 'تشغيل البث'}
          >
            {isPlaying ? <IconPlayerPause size="2.5rem" /> : <IconPlayerPlay size="2.5rem" />}
          </button>

          <button
            className={`btn btn-flat embed-hidden ${isFavorite ? 'text-danger' : 'text-body'}`}
            type="button"
            onClick={onFavorite}
          >
            {isFavorite ? (
              <IconHeartFilled size="1.5rem" className="me-2" />
            ) : (
              <IconHeart size="1.5rem" className="me-2" />
            )}
            <span>{isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
          </button>
        </div>

        <p className="small text-secondary opacity-75">يتم تشغيل البث المباشر من مصدره الرسمي بجودة عالية</p>
      </div>
    </div>
  )
}
