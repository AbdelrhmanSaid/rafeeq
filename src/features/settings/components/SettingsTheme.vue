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
const DEFAULT_PRIMARY = '#a25a3c'

const colors = [
  { label: 'الافتراضي', value: '' },
  { label: 'أخضر', value: '#1B5E20' },
  { label: 'فيروزي', value: '#00897B' },
  { label: 'أزرق', value: '#1565C0' },
  { label: 'كحلي', value: '#0D47A1' },
  { label: 'رملي', value: '#C2A878' },
]

// A segmented control: one muted track with the chosen segment washed in the
// app's selected-state fill, which reads the same way in both modes.
const segmentClass =
  'min-h-11 flex-1 rounded-full px-2 text-sm font-medium text-muted-foreground data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:shadow-sm'
</script>

<template>
  <SettingsSection title="المظهر" description="اختر وضع العرض واللون الأساسي للتطبيق" :icon="IconPalette">
    <div class="space-y-5">
      <ToggleGroup
        type="single"
        :spacing="1"
        :model-value="theme.mode"
        class="grid w-full grid-cols-3 gap-1 rounded-full bg-muted p-1"
        @update:model-value="theme.setMode"
      >
        <ToggleGroupItem value="light" :class="segmentClass">
          <IconSunFilled class="size-4" />
          <span>فاتح</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" :class="segmentClass">
          <IconMoonStars class="size-4" />
          <span>داكن</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="system" :class="segmentClass">
          <IconDeviceLaptop class="size-4" />
          <span>تلقائي</span>
        </ToggleGroupItem>
      </ToggleGroup>

      <div>
        <span class="mb-3 block text-sm font-medium">اللون الأساسي</span>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <button
            v-for="color in colors"
            :key="color.value"
            type="button"
            :class="
              cn(
                'flex min-h-11 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-1 py-2.5 transition duration-200 hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98]',
                theme.primaryColor === color.value && 'bg-accent',
              )
            "
            @click="theme.setPrimaryColor(color.value)"
          >
            <span
              class="grid size-9 place-items-center rounded-full text-white shadow-sm"
              :style="{ background: color.value || DEFAULT_PRIMARY }"
            >
              <IconCheck v-if="theme.primaryColor === color.value" class="size-4" />
            </span>
            <span class="text-xs text-muted-foreground">{{ color.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </SettingsSection>
</template>
