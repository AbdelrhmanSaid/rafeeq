import { createContext, useContext } from 'react'

// When true, <SettingsSection> renders only its form body. Set by hosts that
// supply their own title and chrome (e.g. the reciter bottom sheet).
export const SettingsBareContext = createContext(false)

export const useSettingsBare = () => useContext(SettingsBareContext)
