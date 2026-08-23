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
    <!-- Every class that also exists on the vendored DrawerContent is written
         with the same `data-[swipe-direction=down]:` prefix so tailwind-merge
         replaces it instead of losing a specificity race. `dvh` keeps the cap
         honest while a mobile browser's toolbars slide in and out. -->
    <DrawerContent
      :aria-describedby="undefined"
      class="mx-auto overflow-hidden border-0 bg-popover text-popover-foreground shadow-xl pb-safe data-[swipe-direction=down]:max-h-[85dvh] data-[swipe-direction=down]:rounded-t-3xl lg:max-w-lg"
    >
      <DrawerHeader class="flex shrink-0 flex-row items-center justify-between gap-3 px-4 pt-2 pb-3">
        <DrawerTitle class="min-w-0 flex-1 truncate text-start text-lg font-medium">{{ title }}</DrawerTitle>
        <Button
          variant="ghost"
          size="icon"
          class="-me-1 size-11 shrink-0 rounded-full text-muted-foreground active:scale-95"
          aria-label="إغلاق"
          @click="emit('close')"
        >
          <IconX class="size-5" />
        </Button>
      </DrawerHeader>

      <!-- `overscroll-contain` keeps a flick at the end of the sheet body from
           chaining to the page behind it. -->
      <div class="min-h-0 overflow-y-auto overscroll-contain">
        <slot />
      </div>
    </DrawerContent>
  </Drawer>
</template>
