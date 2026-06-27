import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

export const SETTINGS_BACKUP_APP = 'rafeeq'
export const SETTINGS_BACKUP_VERSION = 1

const DYNAMIC_KEY_PREFIXES = [`${STORAGE_KEYS.azkarProgress}:`]
const MANAGED_KEYS = new Set(Object.values(STORAGE_KEYS))

function isManagedStorageKey(key) {
  return MANAGED_KEYS.has(key) || DYNAMIC_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
}

export function listSettingsStorageKeys(storage = localStorage) {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter(Boolean)
    .filter(isManagedStorageKey)
    .sort()
}

export function createSettingsBackup(storage = localStorage) {
  const settings = {}

  for (const key of listSettingsStorageKeys(storage)) {
    const value = storage.getItem(key)
    if (value !== null) settings[key] = value
  }

  return {
    app: SETTINGS_BACKUP_APP,
    version: SETTINGS_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
  }
}

export function serializeSettingsBackup(storage = localStorage) {
  return `${JSON.stringify(createSettingsBackup(storage), null, 2)}\n`
}

function parseSettingsBackup(fileContents) {
  let backup

  try {
    backup = JSON.parse(fileContents)
  } catch {
    throw new Error('INVALID_JSON')
  }

  if (
    backup?.app !== SETTINGS_BACKUP_APP ||
    backup?.version !== SETTINGS_BACKUP_VERSION ||
    !backup.settings ||
    typeof backup.settings !== 'object' ||
    Array.isArray(backup.settings)
  ) {
    throw new Error('INVALID_BACKUP')
  }

  const entries = Object.entries(backup.settings)

  if (entries.some(([key, value]) => !isManagedStorageKey(key) || typeof value !== 'string')) {
    throw new Error('INVALID_BACKUP')
  }

  return entries
}

export function restoreSettingsBackup(fileContents, storage = localStorage) {
  const entries = parseSettingsBackup(fileContents)

  for (const key of listSettingsStorageKeys(storage)) {
    storage.removeItem(key)
  }

  for (const [key, value] of entries) {
    storage.setItem(key, value)
  }

  return { importedCount: entries.length }
}
