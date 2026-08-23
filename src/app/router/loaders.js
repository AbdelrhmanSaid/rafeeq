import { data, isRouteErrorResponse } from 'react-router-dom'

import { SETTINGS_TAB_IDS } from '@/features/settings/tabs'

// Route loaders that validate dynamic params before a view renders. Throwing a
// 404 Response sends React Router to the route's errorElement (the not-found
// page) instead of letting the view fire an API request for garbage input.

export const FIRST_SURAH = 1
export const LAST_SURAH = 114

// Canonical digits only (no leading zeros): the raw param doubles as the
// offline cache key, so '001' must not slip through as a second key for surah 1.
export const isValidSurah = (value) =>
  /^[1-9]\d*$/.test(String(value)) && Number(value) >= FIRST_SURAH && Number(value) <= LAST_SURAH

export const isValidSettingsTab = (value) => value === undefined || SETTINGS_TAB_IDS.includes(value)

export const notFound = () => data(null, { status: 404, statusText: 'Not Found' })

// Thrown responses reach errorElement as React Router's ErrorResponse.
export const isNotFoundError = (error) => isRouteErrorResponse(error) && error.status === 404

// Builds a loader that 404s unless `validate(params)` holds.
export const requireParams =
  (validate) =>
  ({ params }) => {
    if (!validate(params)) throw notFound()
    return null
  }

export const surahLoader = requireParams(({ surah }) => isValidSurah(surah))
export const settingsLoader = requireParams(({ tab }) => isValidSettingsTab(tab))
