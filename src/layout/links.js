import { IconBrandGithub, IconBug, IconHeart, IconShieldLock } from '@tabler/icons-vue'

export const TELEGRAM_URL = 'https://t.me/rafeeqme'
export const GITHUB_URL = 'https://github.com/AbdelrhmanSaid/rafeeq'
export const DONATE_URL = 'https://buymeacoffee.com/abdelrhmansaid'

export const supportLinks = [
  { title: 'المساهمة في التطوير', link: GITHUB_URL, icon: IconBrandGithub },
  { title: 'الإبلاغ عن مشكلة', link: `${GITHUB_URL}/issues`, icon: IconBug },
  { title: 'دعم المطور', link: DONATE_URL, icon: IconHeart },
  { title: 'سياسة الخصوصية', link: '/privacy', icon: IconShieldLock },
]
