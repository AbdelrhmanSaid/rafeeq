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

const rowClass = {
  downloaded: 'bg-success/10',
  downloading: 'bg-primary/10',
}

const actionClass = {
  'not-downloaded': 'bg-secondary text-primary hover:bg-primary hover:text-primary-foreground',
  'downloaded': 'bg-success text-success-foreground hover:bg-destructive hover:text-destructive-foreground',
  'downloading': 'bg-primary text-primary-foreground',
  'queued': 'bg-secondary text-muted-foreground hover:bg-secondary hover:text-muted-foreground',
}

const rowTone = computed(() => rowClass[props.asset.status] ?? '')
const actionTone = computed(() => actionClass[props.asset.status] ?? '')
</script>

<template>
  <div class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0" :class="rowTone">
    <div
      class="flex size-9 shrink-0 items-center justify-center rounded-md"
      :class="asset.type === 'surah' ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success'"
    >
      <IconBook2 v-if="asset.type === 'surah'" :size="18" />
      <IconSparkles v-else :size="18" />
    </div>

    <div class="min-w-0 flex-1">
      <span class="block truncate text-sm font-medium">{{ asset.name }}</span>
      <span class="text-xs text-muted-foreground">{{ asset.type === 'surah' ? 'سورة' : 'أذكار' }}</span>
      <!-- The queue reports no byte-level progress, so the bar only signals that
           this asset is the one currently downloading. -->
      <Progress v-if="asset.status === 'downloading'" :model-value="100" class="mt-1.5 h-1 animate-pulse" />
    </div>

    <Button
      size="icon"
      class="shrink-0 rounded-full"
      :class="actionTone"
      @click="$emit('action', asset)"
      :disabled="asset.status === 'downloading' || (!online && asset.status === 'not-downloaded')"
    >
      <IconCheck v-if="asset.status === 'downloaded'" :size="16" />
      <IconLoader2 v-else-if="asset.status === 'downloading'" :size="16" class="animate-spin" />
      <span v-else-if="asset.status === 'queued'" class="size-2 shrink-0 rounded-full bg-current animate-pulse"></span>
      <IconDownload v-else :size="16" />
    </Button>
  </div>
</template>
