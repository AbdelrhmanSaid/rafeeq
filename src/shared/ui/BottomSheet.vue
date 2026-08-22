<script setup>
import { IconX } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/components/ui/drawer'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['close'])

// The drawer dismisses itself on a backdrop click, on Escape and on a swipe
// down; every one of those reports `open: false`, which we forward as `close`
// so the parent prop stays the single source of truth for `show`.
const onOpenChange = (open) => {
  if (!open) emit('close')
}
</script>

<template>
  <!-- The drawer is modal, so reka-ui locks the background page scroll while it
       is open — the backdrop stays put instead of scrolling behind the panel. -->
  <Drawer :open="show" @update:open="onOpenChange">
    <DrawerContent
      :aria-describedby="undefined"
      class="mx-auto overflow-hidden pb-[env(safe-area-inset-bottom)] data-[swipe-direction=down]:max-h-[85vh] lg:max-w-lg"
    >
      <DrawerHeader class="flex shrink-0 flex-row items-center justify-between gap-3 border-b p-4">
        <DrawerTitle class="text-lg">{{ title }}</DrawerTitle>
        <Button variant="ghost" size="icon" aria-label="إغلاق" @click="emit('close')">
          <IconX class="size-5" />
        </Button>
      </DrawerHeader>

      <div class="min-h-0 overflow-y-auto">
        <slot />
      </div>
    </DrawerContent>
  </Drawer>
</template>
