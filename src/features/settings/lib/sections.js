// The settings sections, each its own screen at /settings/<id>. The router takes its document titles from here.
export const SETTINGS_SECTION_LABELS = {
  appearance: 'المظهر',
  prayer: 'مواقيت الصلاة',
  quran: 'القرآن',
  azkar: 'الأذكار',
  app: 'التطبيق',
  downloads: 'التنزيلات',
}

// Injection key for the title of the settings screen a section is shown on.
export const SETTINGS_PAGE_TITLE = Symbol('settings-page-title')
