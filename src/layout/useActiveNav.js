import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Route names grouped by the primary nav section they belong to, so a detail
// route (e.g. quran-surah) keeps its parent tab highlighted.
export const NAV_GROUPS = {
  quran: ['quran', 'quran-surah'],
  azkar: ['azkar', 'azkar-category'],
  radio: ['radio', 'radio-station'],
}

export function isNavGroupActive(group, routeName) {
  return NAV_GROUPS[group]?.includes(routeName) ?? false
}

export function useActiveNav() {
  const route = useRoute()

  return {
    isQuranActive: computed(() => isNavGroupActive('quran', route.name)),
    isAzkarActive: computed(() => isNavGroupActive('azkar', route.name)),
    isRadioActive: computed(() => isNavGroupActive('radio', route.name)),
  }
}
