// Store screenshots shown in the install dialog (Chrome, Edge) and app stores.
const screenshot = (name, formFactor, label) => ({
  src: `screenshots/${name}.png`,
  sizes: formFactor === 'wide' ? '2880x1800' : '1170x2532',
  type: 'image/png',
  form_factor: formFactor,
  label,
})

export const manifestScreenshots = [
  screenshot('wide-home', 'wide', 'قرآنك وأذكارك وصلاتك معًا'),
  screenshot('wide-mushaf', 'wide', 'مصحف المدينة بين يديك'),
  screenshot('wide-azkar', 'wide', 'حصّن يومك بالأذكار'),
  screenshot('wide-radio', 'wide', 'استمع للقرآن في أي وقت'),
  screenshot('narrow-hero', 'narrow', 'قرآنك وأذكارك وصلاتك معًا'),
  screenshot('narrow-home', 'narrow', 'لا تفوتك صلاة'),
  screenshot('narrow-mushaf', 'narrow', 'مصحف المدينة بين يديك'),
  screenshot('narrow-azkar', 'narrow', 'حصّن يومك بالأذكار'),
  screenshot('narrow-radio', 'narrow', 'استمع للقرآن في أي وقت'),
  screenshot('narrow-sebha', 'narrow', 'سبّح بلمسة واحدة'),
  screenshot('narrow-zakat', 'narrow', 'احسب زكاتك بسهولة'),
]
