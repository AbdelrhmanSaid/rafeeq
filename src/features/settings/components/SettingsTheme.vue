<script setup>
import { useThemeStore } from '@/app/stores/theme'
import { IconCheck, IconSunFilled, IconMoonStars, IconDeviceLaptop, IconPalette } from '@tabler/icons-vue'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'
import { cn } from '@/shared/lib/utils'
import SettingsSection from './SettingsSection.vue'

const theme = useThemeStore()

// Mirrors the `--primary` default declared in `src/shared/styles/main.css`, so
// the "الافتراضي" swatch keeps showing the shipped accent even while a custom
// one is active (picking it clears the override instead of setting a color).
const DEFAULT_PRIMARY = '#795547'

const colors = [
  { label: 'الافتراضي', value: '' },
  { label: 'أخضر', value: '#1B5E20' },
  { label: 'فيروزي', value: '#00897B' },
  { label: 'أزرق', value: '#1565C0' },
  { label: 'كحلي', value: '#0D47A1' },
  { label: 'رملي', value: '#C2A878' },
]
</script>

<template>
  <SettingsSection title="المظهر" description="اختر وضع العرض واللون الأساسي للتطبيق" :icon="IconPalette">
    <div class="space-y-4">
      <ToggleGroup
        type="single"
        variant="outline"
        :spacing="1"
        :model-value="theme.mode"
        class="w-full gap-2"
        @update:model-value="theme.setMode"
      >
        <ToggleGroupItem value="light" class="flex-1">
          <IconSunFilled :size="16" />
          <span>فاتح</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" class="flex-1">
          <IconMoonStars :size="16" />
          <span>داكن</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="system" class="flex-1">
          <IconDeviceLaptop :size="16" />
          <span>تلقائي</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div>
        <span class="mb-2 block text-sm font-medium">اللون الأساسي</span>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(3.75rem,1fr))] gap-2">
          <button
            v-for="color in colors"
            :key="color.value"
            type="button"
            :class="
              cn(
                'flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-transparent px-1 py-2 transition-colors hover:bg-secondary',
                theme.primaryColor === color.value && 'border-border bg-secondary',
              )
            "
            @click="theme.setPrimaryColor(color.value)"
          >
            <span
              class="grid size-8 place-items-center rounded-full text-white"
              :style="{ background: color.value || DEFAULT_PRIMARY }"
            >
              <IconCheck v-if="theme.primaryColor === color.value" :size="14" />
            </span>
            <span class="text-xs text-muted-foreground">{{ color.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </SettingsSection>
</template>
