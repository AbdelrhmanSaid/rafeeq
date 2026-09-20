import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconCompass,
  IconCoins,
  IconAbacus,
  IconSettings,
} from '@tabler/icons-vue'

export const navigation = [
  {
    name: 'home',
    label: 'الرئيسية',
    icon: IconHome,
    menus: ['navbar', 'tabbar'],
  },
  {
    name: 'quran',
    label: 'القرآن الكريم',
    icon: IconBook,
    menus: ['navbar', 'tabbar'],
  },
  {
    name: 'azkar',
    label: 'الأذكار',
    icon: IconSparkles,
    menus: ['navbar', 'tabbar'],
  },
  {
    name: 'radio',
    label: 'الإذاعة',
    icon: IconRadio,
    menus: ['navbar', 'tabbar'],
  },
  {
    name: 'qibla',
    label: 'اتجاه القبلة',
    icon: IconCompass,
    menus: ['tabbar-more'],
  },
  {
    name: 'zakat',
    label: 'حاسبة الزكاة',
    icon: IconCoins,
    menus: ['navbar-more', 'tabbar-more'],
  },
  {
    name: 'sebha',
    label: 'السبحة الإلكترونية',
    icon: IconAbacus,
    menus: ['navbar-more', 'tabbar-more'],
  },
  {
    name: 'settings',
    label: 'الإعدادات',
    icon: IconSettings,
    menus: ['navbar-more', 'tabbar-more'],
  },
]
