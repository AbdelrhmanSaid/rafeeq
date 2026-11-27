// Changing a value discards the corresponding setting for existing users.
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
  prayerCalcMethod: 'prayer-calc-method',
  prayerCalcSchool: 'prayer-calc-school',
  prayerCalcLatitudeAdjustment: 'prayer-calc-latitude-adjustment',
  prayerCalcShafaq: 'prayer-calc-shafaq',

  currentReciter: 'currentReciter',
  currentTafseer: 'currentTafseer',

  installPromptDismissed: 'install-prompt-dismissed',

  azkarProgress: 'azkar-progress',
  azkarFavorites: 'azkarFavorites',
  quranFavorites: 'quranFavorites',
  // The single bookmark of the old reader, read once to move it into quranBookmarks on first load.
  quranBookmark: 'quranBookmark',
  quranBookmarks: 'quran-bookmarks',
  quranLastPage: 'quran-last-page',
  quranReaderBackground: 'quran-reader-background',
  radioFavorites: 'radioFavorites',

  sebhaCount: 'sebha-count',
}
