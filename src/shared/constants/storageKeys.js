// Single source of truth for every localStorage key. The string values must
// stay stable — changing one discards that setting for existing users.
export const STORAGE_KEYS = {
  autoUpdateServiceWorker: 'auto-update-service-worker',
  zekrVibrationEnabled: 'zekr-vibration-enabled',
  zekrVibrationIntensity: 'zekr-vibration-intensity',
  zekrMoveNextOnComplete: 'zekr-move-next-on-complete',
  zekrSaveProgress: 'zekr-save-progress',
  zekrConfirmOnLeave: 'zekr-confirm-on-leave',

  themeMode: 'mode',
  themePrimary: 'theme-primary',
  fontScale: 'font-scale',

  longitude: 'longitude',
  latitude: 'latitude',
  prayerTimesLayout: 'prayer-times-layout',

  currentReciter: 'currentReciter',

  azkarProgress: 'azkar-progress',
  azkarFavorites: 'azkarFavorites',
  quranFavorites: 'quranFavorites',
  quranBookmark: 'quranBookmark',
  radioFavorites: 'radioFavorites',
}
