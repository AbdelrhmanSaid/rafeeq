import { useRoute } from 'vue-router'

const NAV_GROUPS = {
  quran: ['quran', 'quran-surah', 'quran-page'],
  azkar: ['azkar', 'azkar-category'],
  radio: ['radio', 'radio-station'],
  more: ['more', 'qibla', 'zakat', 'sebha', 'settings', 'settings-section', 'privacy'],
}

export function isNavGroupActive(group, routeName) {
  return NAV_GROUPS[group]?.includes(routeName) ?? group === routeName
}

export function useActiveNav() {
  const route = useRoute()

  return {
    isActive: (group) => isNavGroupActive(group, route.name),
  }
}
