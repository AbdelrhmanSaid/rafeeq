import { useRoute } from 'vue-router'

// Keep detail routes grouped under their parent nav item.
export const NAV_GROUPS = {
  quran: ['quran', 'quran-surah'],
  azkar: ['azkar', 'azkar-category'],
  radio: ['radio', 'radio-station'],
  // The More tab stands for every screen it opens, like a native tab bar's overflow tab.
  more: ['more', 'qibla', 'zakat', 'sebha', 'settings', 'settings-section', 'privacy'],
}

export function isNavGroupActive(group, routeName) {
  // Ungrouped items, like home, are active only on their own route.
  return NAV_GROUPS[group]?.includes(routeName) ?? group === routeName
}

export function useActiveNav() {
  const route = useRoute()

  return {
    isActive: (group) => isNavGroupActive(group, route.name),
  }
}
