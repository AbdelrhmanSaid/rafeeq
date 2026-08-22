<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'

import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconDotsCircleHorizontal,
  IconBrandTelegram,
  IconX,
} from '@tabler/icons-vue'

import { cn } from '@/shared/lib/utils'

import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/components/ui/drawer'

const radio = useRadioStore()

// The slide-up sheet is reka-ui's drawer now, so it owns the open/close
// animation; this ref only mirrors its state so navigating from a link can
// close it.
const showMoreMenu = ref(false)

const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()

const closeMoreMenu = () => {
  showMoreMenu.value = false
}

const tabItemClass =
  'flex min-w-16 flex-col items-center gap-1 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:text-foreground [&.router-link-active]:bg-primary/10 [&.router-link-active]:text-foreground'

// Merged with cn() at the call sites: the detail-route active state has to
// beat the base `text-muted-foreground`, and Tailwind emits that utility
// after `text-foreground`, so plain class concatenation would lose.
const tabItemActiveClass = 'bg-primary/10 text-foreground'

const moreMenuItemClass =
  'flex w-full items-center gap-3 px-5 py-3 text-start transition-colors hover:bg-secondary [&.router-link-active]:bg-primary/10 [&.router-link-active]:text-primary'
</script>

<template>
  <div>
    <Drawer v-model:open="showMoreMenu">
      <!-- Tab Bar -->
      <!-- min-h (not h) so labels and icons at large font scales grow the bar
           instead of clipping, and items stay vertically centered so short
           content (small font) doesn't stick to the top of the bar. -->
      <nav
        class="fixed inset-x-0 bottom-0 z-40 flex min-h-[var(--navbar-height)] items-center justify-around border-t bg-background pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
      >
        <RouterLink :to="{ name: 'home' }" :class="tabItemClass">
          <IconHome size="1.5rem" />
          <span class="text-[0.7rem]">الرئيسية</span>
        </RouterLink>

        <RouterLink :to="{ name: 'quran' }" :class="cn(tabItemClass, isQuranActive && tabItemActiveClass)">
          <IconBook size="1.5rem" />
          <span class="text-[0.7rem]">القرآن</span>
        </RouterLink>

        <RouterLink :to="{ name: 'azkar' }" :class="cn(tabItemClass, isAzkarActive && tabItemActiveClass)">
          <IconSparkles size="1.5rem" />
          <span class="text-[0.7rem]">الأذكار</span>
        </RouterLink>

        <RouterLink :to="{ name: 'radio' }" :class="cn(tabItemClass, 'relative', isRadioActive && tabItemActiveClass)">
          <IconRadio size="1.5rem" />
          <span class="text-[0.7rem]">الإذاعة</span>
          <span
            v-if="radio.isPlaying"
            class="radio-status absolute -top-0.5 -end-0.5 size-1.5 rounded-full bg-destructive"
          />
        </RouterLink>

        <DrawerTrigger as-child>
          <button type="button" :class="tabItemClass">
            <IconDotsCircleHorizontal size="1.5rem" />
            <span class="text-[0.7rem]">المزيد</span>
          </button>
        </DrawerTrigger>
      </nav>

      <!-- More Menu -->
      <DrawerContent class="data-[swipe-direction=down]:max-h-[70vh]">
        <DrawerHeader class="flex-row items-center justify-between border-b p-3">
          <DrawerTitle>المزيد</DrawerTitle>
          <DrawerClose as-child>
            <Button variant="ghost" size="icon" type="button" aria-label="إغلاق">
              <IconX size="1.25rem" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div class="overflow-y-auto py-3">
          <RouterLink :to="{ name: 'qibla' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            اتجاه القبلة
          </RouterLink>
          <RouterLink :to="{ name: 'zakat' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            حاسبة الزكاة
          </RouterLink>
          <RouterLink :to="{ name: 'sebha' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            السبحة الإلكترونية
          </RouterLink>
          <RouterLink :to="{ name: 'settings' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            الإعدادات
          </RouterLink>

          <Separator class="my-3" />

          <a href="https://t.me/rafeeqme" target="_blank" :class="moreMenuItemClass" @click="closeMoreMenu">
            <IconBrandTelegram size="1.25rem" />
            قناة التليجرام
          </a>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style scoped>
/* Tailwind's `animate-pulse` fades opacity; the radio dot pulses by scale. */
@keyframes radio-pulse {
  0%,
  100% {
    transform: scale(0.9);
  }

  50% {
    transform: scale(1.1);
  }
}

.radio-status {
  animation: radio-pulse 1s infinite;
}
</style>
