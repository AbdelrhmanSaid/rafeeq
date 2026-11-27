import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import SettingsImportExport from './SettingsImportExport.vue'
import { serializeSettingsBackup } from '../lib/backup.js'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

vi.mock('vue-sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), dismiss: vi.fn() } }))
vi.mock('@/shared/composables/useIsMobile', () => ({ useIsMobile: () => ref(true) }))

const wrappers = []

function mountSection() {
  const wrapper = mount(SettingsImportExport, { attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}

async function pick(wrapper, contents) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [new File([contents], 'backup.json')], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

const sheets = () => document.querySelectorAll('[role="dialog"]')

describe('SettingsImportExport', () => {
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
    document.body.innerHTML = ''
    localStorage.clear()
  })

  it('rejects a file that is not a backup without asking to replace anything', async () => {
    const wrapper = mountSection()

    await pick(wrapper, '{ not json')

    expect(sheets()).toHaveLength(0)
    expect(toast.error).toHaveBeenCalledTimes(1)
  })

  it('asks once, with the count, for a valid backup even when picked twice', async () => {
    localStorage.setItem(STORAGE_KEYS.fontScale, '110')
    const backup = serializeSettingsBackup()
    const wrapper = mountSection()

    await pick(wrapper, backup)
    await pick(wrapper, backup)

    expect(sheets()).toHaveLength(1)
    expect(sheets()[0].textContent).toContain('عنصر واحد')
  })
})
