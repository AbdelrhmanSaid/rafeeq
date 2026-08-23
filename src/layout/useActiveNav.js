import { useLocation } from 'react-router-dom'

// Base path of each primary nav section, so a detail route (e.g. /quran/2)
// keeps its parent tab highlighted.
export const NAV_GROUPS = {
  quran: '/quran',
  azkar: '/azkar',
  radio: '/radio',
}

export function isNavGroupActive(group, pathname) {
  const base = NAV_GROUPS[group]
  if (!base) return false

  return pathname === base || pathname.startsWith(`${base}/`)
}

export function useActiveNav() {
  const { pathname } = useLocation()

  return {
    isQuranActive: isNavGroupActive('quran', pathname),
    isAzkarActive: isNavGroupActive('azkar', pathname),
    isRadioActive: isNavGroupActive('radio', pathname),
  }
}
