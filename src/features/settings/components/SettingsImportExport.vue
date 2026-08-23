<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { IconFileExport, IconFileImport, IconRestore } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import SettingsSection from './SettingsSection.vue'
import { listSettingsStorageKeys, restoreSettingsBackup, serializeSettingsBackup } from '../lib/backup.js'
import { toArabicNumerals } from '@/shared/utils/arabic'

const fileInput = ref(null)
const isImporting = ref(false)

function exportSettings() {
  const blob = new Blob([serializeSettingsBackup()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `rafeeq-settings-${new Date().toLocaleDateString('en-CA')}.json`
  link.click()

  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  toast.success(`تم تصدير ${toArabicNumerals(listSettingsStorageKeys().length)} عنصر`)
}

function applyImport(contents) {
  try {
    const { importedCount } = restoreSettingsBackup(contents)
    toast.success(`تم استيراد ${toArabicNumerals(importedCount)} عنصر`)
    window.setTimeout(() => window.location.reload(), 800)
  } catch {
    toast.error('ملف الاستيراد غير صالح')
  }
}

async function importSettings(event) {
  const [file] = event.target.files ?? []
  event.target.value = ''
  if (!file) return

  isImporting.value = true

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
    isImporting.value = false
  }
}
</script>

<template>
  <SettingsSection
    title="الاستيراد والتصدير"
    description="احتفظ بنسخة احتياطية من الإعدادات أو قم باستيراد الإعدادات المحفوظة على هذا الجهاز"
    :icon="IconRestore"
  >
    <div class="flex flex-col gap-2 sm:flex-row">
      <Button type="button" class="h-11 flex-1 rounded-full active:scale-[0.98]" @click="exportSettings">
        <IconFileExport class="size-4" />
        <span>تصدير الإعدادات</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        class="h-11 flex-1 rounded-full bg-muted hover:bg-accent active:scale-[0.98] dark:hover:bg-accent"
        :disabled="isImporting"
        @click="fileInput?.click()"
      >
        <IconFileImport class="size-4" />
        <span>استيراد الإعدادات</span>
      </Button>
    </div>

    <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="importSettings" />
  </SettingsSection>
</template>
