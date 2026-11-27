// The app's looks: two light and two dark. `swatch` paints a look's dot in the pickers with the current primary colour,
// and is kept in step with the matching rules in base.scss.
export const SYSTEM_THEME = 'system'

export const THEMES = [
  {
    value: SYSTEM_THEME,
    label: 'تلقائي',
    scheme: null,
    swatch:
      'linear-gradient(135deg, color-mix(in srgb, #fff 96%, var(--bs-primary)) 50%, color-mix(in srgb, #121212 95%, var(--bs-primary)) 50%)',
    ink: '#fff',
  },
  {
    value: 'light',
    label: 'فاتح',
    scheme: 'light',
    swatch: 'color-mix(in srgb, #fff 96%, var(--bs-primary))',
    ink: '#212529',
  },
  {
    value: 'paper',
    label: 'ورقي',
    scheme: 'light',
    swatch: 'color-mix(in srgb, #fbf6e8 96%, var(--bs-primary))',
    ink: '#212529',
  },
  {
    value: 'dark',
    label: 'داكن',
    scheme: 'dark',
    swatch: 'color-mix(in srgb, #121212 95%, var(--bs-primary))',
    ink: '#fff',
  },
  { value: 'black', label: 'أسود', scheme: 'dark', swatch: '#000', ink: '#fff' },
]

export const themeOf = (value) => THEMES.find((theme) => theme.value === value) ?? null

// Each scheme's plain look is drawn by Bootstrap's own theme; the others add a paper on top.
export const paperOf = (value) => (value === 'paper' || value === 'black' ? value : null)
