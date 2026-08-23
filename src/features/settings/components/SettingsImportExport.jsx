import { useRef, useState } from 'react'
import { IconFileExport, IconFileImport, IconRestore } from '@tabler/icons-react'
import { toast } from 'sonner'

import SettingsSection from './SettingsSection'
import { listSettingsStorageKeys, restoreSettingsBackup, serializeSettingsBackup } from '../lib/backup.js'
import { toArabicNumerals } from '@/shared/utils/arabic'

export default function SettingsImportExport() {
  const fileInput = useRef(null)
  const [isImporting, setIsImporting] = useState(false)

  const exportSettings = () => {
    const blob = new Blob([serializeSettingsBackup()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `rafeeq-settings-${new Date().toLocaleDateString('en-CA')}.json`
    link.click()

    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    toast.success(`تم تصدير ${toArabicNumerals(listSettingsStorageKeys().length)} عنصر`)
  }

  const applyImport = (contents) => {
    try {
      const { importedCount } = restoreSettingsBackup(contents)
      toast.success(`تم استيراد ${toArabicNumerals(importedCount)} عنصر`)
      // Reload so every store re-hydrates from the restored storage.
      window.setTimeout(() => window.location.reload(), 800)
    } catch {
      toast.error('ملف الاستيراد غير صالح')
    }
  }

  const importSettings = async (event) => {
    const [file] = event.target.files ?? []
    event.target.value = ''
    if (!file) return

    setIsImporting(true)

    try {
      const contents = await file.text()

      toast.warning('سيتم استبدال إعدادات وبيانات رفيق المحفوظة على هذا الجهاز.', {
        position: 'bottom-center',
        duration: Infinity,
        action: {
          label: 'استيراد',
          onClick: () => applyImport(contents),
        },
      })
    } catch {
      toast.error('تعذر قراءة الملف')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <SettingsSection
      title="الاستيراد والتصدير"
      description="احتفظ بنسخة احتياطية من الإعدادات أو قم باستيراد الإعدادات المحفوظة على هذا الجهاز"
      icon={IconRestore}
    >
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
          onClick={exportSettings}
        >
          <IconFileExport size="18" />
          <span>تصدير الإعدادات</span>
        </button>

        <button
          type="button"
          className="btn btn-sm btn-flat d-inline-flex align-items-center gap-2"
          disabled={isImporting}
          onClick={() => fileInput.current?.click()}
        >
          <IconFileImport size="18" />
          <span>استيراد الإعدادات</span>
        </button>
      </div>

      <input
        ref={fileInput}
        className="visually-hidden"
        type="file"
        accept="application/json,.json"
        onChange={importSettings}
      />
    </SettingsSection>
  )
}
