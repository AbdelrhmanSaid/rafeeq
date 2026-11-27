// The reader's background. Each one but the default also sets the scheme, so the bars and sheets match the page.
export const DEFAULT_READER_BACKGROUND = 'default'

export default [
  { value: DEFAULT_READER_BACKGROUND, label: 'افتراضي', mode: null, color: null },
  { value: 'white', label: 'أبيض', mode: 'light', color: '#ffffff' },
  { value: 'yellow', label: 'أصفر', mode: 'light', color: '#f7efd8' },
  { value: 'dark', label: 'داكن', mode: 'dark', color: '#202124' },
  { value: 'black', label: 'أسود', mode: 'dark', color: '#000000' },
]
