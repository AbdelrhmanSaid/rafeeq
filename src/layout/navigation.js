import {
  IconSmartHome,
  IconBook,
  IconSparkles,
  IconBroadcast,
  IconCompass,
  IconCoins,
  IconAbacus,
  IconSettings,
  IconLayoutGrid,
} from '@tabler/icons-vue'

export const navigation = [
  {
    name: 'home',
    label: 'الرئيسية',
    icon: IconSmartHome,
    menus: ['navbar', 'tabbar'],
  },
  {
    name: 'quran',
    label: 'القرآن',
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
    icon: IconBroadcast,
    menus: ['navbar', 'tabbar'],
  },
  {
    name: 'more',
    label: 'المزيد',
    icon: IconLayoutGrid,
    menus: ['tabbar'],
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
    menus: ['navbar-more'],
  },
]
