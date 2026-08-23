<script setup>
import { computed } from 'vue'
import { IconBook2, IconSparkles, IconCheck, IconLoader2, IconDownload } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'

const props = defineProps({
  asset: { type: Object, required: true },
  online: { type: Boolean, default: true },
})

defineEmits(['action'])

// A downloaded or in-flight row is washed in its state colour; the rest sit on
// the plain card surface. The list itself supplies the hairlines.
const rowClass = {
  downloaded: 'bg-success/8',
  downloading: 'bg-primary/10',
}

// The action button doubles as the status indicator, so its tone is the state:
// tinted while there is something to do, solid while it is the one downloading,
// and destructive on hover once the file is on the device.
const actionClass = {
  'not-downloaded': 'bg-primary/12 text-primary hover:bg-primary hover:text-primary-foreground',
  'downloaded': 'bg-success/15 text-success hover:bg-destructive hover:text-destructive-foreground',
  'downloading': 'bg-primary text-primary-foreground',
  'queued': 'bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground',
}

const rowTone = computed(() => rowClass[props.asset.status] ?? '')
const actionTone = computed(() => actionClass[props.asset.status] ?? '')
</script>

<template>
  <div class="flex min-h-14 items-center gap-3 px-4 py-2.5" :class="rowTone">
    <div
      class="grid size-10 shrink-0 place-items-center rounded-full"
      :class="asset.type === 'surah' ? 'bg-primary/12 text-primary' : 'bg-success/15 text-success'"
    >
      <IconBook2 v-if="asset.type === 'surah'" class="size-5" />
      <IconSparkles v-else class="size-5" />
    </div>

    <div class="min-w-0 flex-1">
      <span class="block truncate text-base font-medium">{{ asset.name }}</span>
      <span class="text-sm text-muted-foreground">{{ asset.type === 'surah' ? 'سورة' : 'أذكار' }}</span>
      <!-- The queue reports no byte-level progress, so the bar only signals that
           this asset is the one currently downloading. -->
      <Progress v-if="asset.status === 'downloading'" :model-value="100" class="mt-2 h-1 animate-pulse" />
    </div>

    <Button
      size="icon"
      class="size-11 shrink-0 rounded-full active:scale-95"
      :class="actionTone"
      @click="$emit('action', asset)"
      :disabled="asset.status === 'downloading' || (!online && asset.status === 'not-downloaded')"
    >
      <IconCheck v-if="asset.status === 'downloaded'" class="size-5" />
      <IconLoader2 v-else-if="asset.status === 'downloading'" class="size-5 animate-spin" />
      <span v-else-if="asset.status === 'queued'" class="size-2 shrink-0 animate-pulse rounded-full bg-current"></span>
      <IconDownload v-else class="size-5" />
    </Button>
  </div>
</template>
