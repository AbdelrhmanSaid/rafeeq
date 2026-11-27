<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { IconArrowBackUp, IconFileExport, IconFileImport } from '@tabler/icons-vue'
import SettingsSection from './SettingsSection.vue'
import BottomSheet from '@/shared/ui/BottomSheet.vue'
import {
  listSettingsStorageKeys,
  parseSettingsBackup,
  restoreSettingsBackup,
  serializeSettingsBackup,
} from '../lib/backup.js'
import { ITEM_FORMS, countLabel } from '../lib/countLabel.js'

const fileInput = ref(null)
const isImporting = ref(false)
// The checked backup waiting for confirmation; picking another file replaces it rather than asking twice.
const pending = ref(null)

function exportSettings() {
  const blob = new Blob([serializeSettingsBackup()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `rafeeq-settings-${new Date().toLocaleDateString('en-CA')}.json`
  link.click()

  window.setTimeout(() => URL.revokeObjectURL(url), 0)
  toast.success(`تم تصدير ${countLabel(listSettingsStorageKeys().length, ITEM_FORMS)}`)
}

function applyImport() {
  const contents = pending.value?.contents
  pending.value = null
  if (contents == null) return

  try {
    const { importedCount } = restoreSettingsBackup(contents)
    toast.success(`تم استيراد ${countLabel(importedCount, ITEM_FORMS)}`)
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
    try {
      const entries = parseSettingsBackup(contents)
      // An earlier file's error would otherwise sit over the confirmation.
      toast.dismiss('settings-import')
      pending.value = { contents, count: entries.length }
    } catch {
      toast.error('هذا الملف ليس نسخة احتياطية من رفيق', { id: 'settings-import' })
    }
  } catch {
    toast.error('تعذر قراءة الملف', { id: 'settings-import' })
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <SettingsSection
    title="الاستيراد والتصدير"
    description="احتفظ بنسخة احتياطية من الإعدادات أو قم باستيراد الإعدادات المحفوظة على هذا الجهاز"
  >
    <div class="backup-actions">
      <button type="button" class="btn btn-sm btn-soft" @click="exportSettings">
        <IconFileExport size="18" aria-hidden="true" />
        <span>تصدير</span>
      </button>

      <button type="button" class="btn btn-sm btn-flat" :disabled="isImporting" @click="fileInput?.click()">
        <IconFileImport size="18" aria-hidden="true" />
        <span>استيراد</span>
      </button>
    </div>

    <input
      ref="fileInput"
      class="visually-hidden"
      type="file"
      accept="application/json,.json"
      tabindex="-1"
      aria-hidden="true"
      @change="importSettings"
    />

    <BottomSheet :show="!!pending" title="استيراد الإعدادات" @close="pending = null">
      <p class="px-4 pt-1 mb-2 lh-lg text-secondary">
        يحتوي الملف على {{ pending ? countLabel(pending.count, ITEM_FORMS) : '' }}، وستُستبدل بها إعدادات وبيانات رفيق
        المحفوظة على هذا الجهاز.
      </p>
      <ul class="bottom-sheet-list">
        <li>
          <button type="button" class="bottom-sheet-item" @click="pending = null">
            <IconArrowBackUp size="20" />
            <span>الإبقاء على الإعدادات الحالية</span>
          </button>
        </li>
        <li>
          <button type="button" class="bottom-sheet-item text-danger" @click="applyImport">
            <IconFileImport size="20" />
            <span>استيراد واستبدال</span>
          </button>
        </li>
      </ul>
    </BottomSheet>
  </SettingsSection>
</template>

<style lang="scss" scoped>
.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.75rem;
    white-space: nowrap;
  }
}
</style>
