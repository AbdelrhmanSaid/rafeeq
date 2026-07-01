export const AUTO = ''

const autoOption = { value: AUTO, label: 'تلقائي' }

export const CALCULATION_METHODS = [
  autoOption,
  { value: '3', label: 'رابطة العالم الإسلامي' },
  { value: '2', label: 'الجمعية الإسلامية لأمريكا الشمالية' },
  { value: '5', label: 'الهيئة المصرية العامة للمساحة' },
  { value: '4', label: 'جامعة أم القرى، مكة المكرمة' },
  { value: '1', label: 'جامعة العلوم الإسلامية، كراتشي' },
  { value: '7', label: 'معهد الجيوفيزياء، جامعة طهران' },
  { value: '0', label: 'الشيعة الإثنا عشرية' },
  { value: '8', label: 'منطقة الخليج' },
  { value: '9', label: 'الكويت' },
  { value: '10', label: 'قطر' },
  { value: '11', label: 'مجلس العلماء الإسلامي، سنغافورة' },
  { value: '12', label: 'الاتحاد الإسلامي في فرنسا' },
  { value: '13', label: 'رئاسة الشؤون الدينية، تركيا' },
  { value: '14', label: 'الإدارة الروحية لمسلمي روسيا' },
  { value: '15', label: 'لجنة رؤية الهلال العالمية' },
  { value: '16', label: 'دبي' },
  { value: '17', label: 'دائرة التنمية الإسلامية الماليزية' },
  { value: '18', label: 'تونس' },
  { value: '19', label: 'الجزائر' },
  { value: '20', label: 'وزارة الشؤون الدينية، إندونيسيا' },
  { value: '21', label: 'المغرب' },
  { value: '22', label: 'الجالية الإسلامية في لشبونة' },
  { value: '23', label: 'وزارة الأوقاف والشؤون الإسلامية، الأردن' },
]

export const SCHOOLS = [autoOption, { value: '0', label: 'شافعي' }, { value: '1', label: 'حنفي' }]

export const LATITUDE_ADJUSTMENT_METHODS = [
  autoOption,
  { value: '1', label: 'منتصف الليل' },
  { value: '2', label: 'السُبع' },
  { value: '3', label: 'حسب الزاوية' },
]

export const MIDNIGHT_MODES = [
  autoOption,
  { value: '0', label: 'قياسي (من الغروب إلى الشروق)' },
  { value: '1', label: 'جعفري (من الغروب إلى الفجر)' },
]

export const SHAFAQ_OPTIONS = [
  autoOption,
  { value: 'general', label: 'عام' },
  { value: 'ahmer', label: 'الأحمر' },
  { value: 'abyad', label: 'الأبيض' },
]

export const CALCULATION_FIELDS = [
  { key: 'calcMethod', param: 'method', label: 'طريقة الحساب', options: CALCULATION_METHODS },
  { key: 'calcSchool', param: 'school', label: 'المذهب (حساب العصر)', options: SCHOOLS },
  {
    key: 'calcLatitudeAdjustment',
    param: 'latitudeAdjustmentMethod',
    label: 'تعديل خطوط العرض العليا',
    options: LATITUDE_ADJUSTMENT_METHODS,
  },
  { key: 'calcMidnightMode', param: 'midnightMode', label: 'وضع منتصف الليل', options: MIDNIGHT_MODES },
  { key: 'calcShafaq', param: 'shafaq', label: 'الشفق', options: SHAFAQ_OPTIONS },
]
