<script setup>
import { IconX } from '@tabler/icons-vue'
import { Button } from '@/shared/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/components/ui/drawer'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const onOpenChange = (open) => {
  if (!open) emit('close')
}
</script>
<template>
  <Drawer :open="show" @update:open="onOpenChange">
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
      <div class="min-h-0 overflow-y-auto overscroll-contain">
        <slot />
      </div>
    </DrawerContent>
  </Drawer>
</template>
