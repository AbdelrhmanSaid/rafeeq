import {
  IconSmartHome,
  IconBook,
  IconSparkles,
  IconBroadcast,
  IconCompass,
  IconCoins,
  IconAbacus,
  IconLayoutGrid,
} from '@tabler/icons-vue'

// `primary` items are the tab bar destinations; `more` items are the tools on the More screen.
export const navigation = [
  {
    name: 'home',
    label: 'الرئيسية',
    icon: IconSmartHome,
    menus: ['primary'],
  },
  {
    name: 'quran',
    label: 'القرآن',
    icon: IconBook,
    menus: ['primary'],
  },
  {
    name: 'azkar',
    label: 'الأذكار',
    icon: IconSparkles,
    menus: ['primary'],
  },
  {
    name: 'radio',
    label: 'الإذاعة',
    icon: IconBroadcast,
    menus: ['primary'],
  },
  {
    name: 'more',
    label: 'المزيد',
    icon: IconLayoutGrid,
    menus: ['primary'],
  },
  {
    name: 'qibla',
    label: 'اتجاه القبلة',
    icon: IconCompass,
    menus: ['more'],
  },
  {
    name: 'zakat',
    label: 'حاسبة الزكاة',
    icon: IconCoins,
    menus: ['more'],
  },
  {
    name: 'sebha',
    label: 'السبحة الإلكترونية',
    icon: IconAbacus,
    menus: ['more'],
  },
]
