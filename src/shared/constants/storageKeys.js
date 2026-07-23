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
  prayerCalcMethod: 'prayer-calc-method',
  prayerCalcSchool: 'prayer-calc-school',
  prayerCalcLatitudeAdjustment: 'prayer-calc-latitude-adjustment',
  prayerCalcMidnightMode: 'prayer-calc-midnight-mode',
  prayerCalcShafaq: 'prayer-calc-shafaq',

  currentReciter: 'currentReciter',
  currentTafseer: 'currentTafseer',
  playbackRate: 'quran-playback-rate',
  mushafLayout: 'mushaf-layout',

  azkarProgress: 'azkar-progress',
  azkarFavorites: 'azkarFavorites',
  quranFavorites: 'quranFavorites',
  quranBookmark: 'quranBookmark',
  radioFavorites: 'radioFavorites',
}
