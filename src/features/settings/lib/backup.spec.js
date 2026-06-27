import { beforeEach, describe, it, expect } from 'vitest'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import {
  SETTINGS_BACKUP_APP,
  SETTINGS_BACKUP_VERSION,
  listSettingsStorageKeys,
  createSettingsBackup,
  serializeSettingsBackup,
  restoreSettingsBackup,
} from './backup'

const DYNAMIC_KEY = `${STORAGE_KEYS.azkarProgress}:fajr`

beforeEach(() => {
  localStorage.clear()
})

describe('listSettingsStorageKeys', () => {
  it('returns only managed keys, sorted, ignoring unmanaged ones', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')
    localStorage.setItem(STORAGE_KEYS.fontScale, '110')
    localStorage.setItem('some-unrelated-key', 'x')

    expect(listSettingsStorageKeys()).toEqual([STORAGE_KEYS.fontScale, STORAGE_KEYS.themeMode].sort())
  })

  it('includes dynamic azkar-progress:* keys', () => {
    localStorage.setItem(DYNAMIC_KEY, '{}')
    localStorage.setItem('azkar-progress-not-dynamic', 'x')

    const keys = listSettingsStorageKeys()
    expect(keys).toContain(DYNAMIC_KEY)
    expect(keys).not.toContain('azkar-progress-not-dynamic')
  })
})

describe('createSettingsBackup', () => {
  it('captures managed keys with backup metadata', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')
    localStorage.setItem('some-unrelated-key', 'x')

    const backup = createSettingsBackup()

    expect(backup.app).toBe(SETTINGS_BACKUP_APP)
    expect(backup.version).toBe(SETTINGS_BACKUP_VERSION)
    expect(typeof backup.exportedAt).toBe('string')
    expect(Number.isNaN(Date.parse(backup.exportedAt))).toBe(false)
    expect(backup.settings).toEqual({ [STORAGE_KEYS.themeMode]: 'dark' })
  })
})

describe('serializeSettingsBackup', () => {
  it('produces pretty-printed JSON terminated by a newline', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')

    const serialized = serializeSettingsBackup()

    expect(serialized.endsWith('\n')).toBe(true)
    expect(JSON.parse(serialized).settings).toEqual({ [STORAGE_KEYS.themeMode]: 'dark' })
  })
})

describe('restoreSettingsBackup', () => {
  it('round-trips an exported backup', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')
    localStorage.setItem(STORAGE_KEYS.fontScale, '110')
    localStorage.setItem(DYNAMIC_KEY, '{"count":3}')

    const serialized = serializeSettingsBackup()
    localStorage.clear()

    const result = restoreSettingsBackup(serialized)

    expect(result).toEqual({ importedCount: 3 })
    expect(localStorage.getItem(STORAGE_KEYS.themeMode)).toBe('dark')
    expect(localStorage.getItem(STORAGE_KEYS.fontScale)).toBe('110')
    expect(localStorage.getItem(DYNAMIC_KEY)).toBe('{"count":3}')
  })

  it('clears stale managed keys before restoring', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')
    const serialized = serializeSettingsBackup()

    // A managed key that is absent from the backup must not survive the restore.
    localStorage.setItem(STORAGE_KEYS.fontScale, '130')
    restoreSettingsBackup(serialized)

    expect(localStorage.getItem(STORAGE_KEYS.fontScale)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.themeMode)).toBe('dark')
  })

  it('leaves unmanaged keys untouched', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')
    const serialized = serializeSettingsBackup()

    localStorage.setItem('some-unrelated-key', 'keep-me')
    restoreSettingsBackup(serialized)

    expect(localStorage.getItem('some-unrelated-key')).toBe('keep-me')
  })

  it('rejects malformed JSON', () => {
    expect(() => restoreSettingsBackup('{ not json')).toThrow('INVALID_JSON')
  })

  it('rejects backups with the wrong app or version', () => {
    const base = { app: SETTINGS_BACKUP_APP, version: SETTINGS_BACKUP_VERSION, settings: {} }

    expect(() => restoreSettingsBackup(JSON.stringify({ ...base, app: 'other' }))).toThrow('INVALID_BACKUP')
    expect(() => restoreSettingsBackup(JSON.stringify({ ...base, version: 99 }))).toThrow('INVALID_BACKUP')
  })

  it('rejects backups whose settings are missing, an array, or hold non-string values', () => {
    const base = { app: SETTINGS_BACKUP_APP, version: SETTINGS_BACKUP_VERSION }

    expect(() => restoreSettingsBackup(JSON.stringify({ ...base }))).toThrow('INVALID_BACKUP')
    expect(() => restoreSettingsBackup(JSON.stringify({ ...base, settings: [] }))).toThrow('INVALID_BACKUP')
    expect(() => restoreSettingsBackup(JSON.stringify({ ...base, settings: { [STORAGE_KEYS.themeMode]: 5 } }))).toThrow(
      'INVALID_BACKUP',
    )
  })

  it('rejects backups containing unmanaged keys', () => {
    const payload = {
      app: SETTINGS_BACKUP_APP,
      version: SETTINGS_BACKUP_VERSION,
      settings: { 'some-unrelated-key': 'x' },
    }

    expect(() => restoreSettingsBackup(JSON.stringify(payload))).toThrow('INVALID_BACKUP')
  })

  it('does not wipe existing data when the backup is invalid', () => {
    localStorage.setItem(STORAGE_KEYS.themeMode, 'dark')

    expect(() => restoreSettingsBackup('{ not json')).toThrow()
    expect(localStorage.getItem(STORAGE_KEYS.themeMode)).toBe('dark')
  })
})
