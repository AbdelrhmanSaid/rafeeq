import { SYSTEM_THEME, THEMES } from '@/shared/constants/themes'

// The reader's own look: the app's looks, or the default, which follows the app.
export const DEFAULT_READER_BACKGROUND = 'default'

export default [
  { value: DEFAULT_READER_BACKGROUND, label: 'افتراضي' },
  ...THEMES.filter((theme) => theme.value !== SYSTEM_THEME).map(({ value, label }) => ({ value, label })),
]
