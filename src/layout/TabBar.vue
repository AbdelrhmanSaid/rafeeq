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
  IconChevronLeft,
  IconCompass,
  IconCoins,
  IconCircleDotted,
  IconSettings,
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

const showMoreMenu = ref(false)

const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()

const closeMoreMenu = () => {
  showMoreMenu.value = false
}

const tabItemClass =
  'flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-1 text-muted-foreground transition duration-200 active:scale-95 hover:text-foreground [&.router-link-active]:bg-primary/12 [&.router-link-active]:text-primary'

const tabItemActiveClass = 'bg-primary/12 text-primary'

const tabLabelClass = 'text-xs leading-none whitespace-nowrap'

const moreMenuItemClass =
  'flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-start transition-colors hover:bg-accent active:bg-accent [&.router-link-active]:bg-primary/12 [&.router-link-active]:text-primary'

const moreMenuIconClass =
  'flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [.router-link-active_&]:bg-primary/15 [.router-link-active_&]:text-primary'
</script>
<template>
  <div>
    <Drawer v-model:open="showMoreMenu">
      <!-- Tab Bar -->
      <nav class="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[calc(0.5rem_+_env(safe-area-inset-bottom,0px))]">
        <div
          class="mx-auto flex min-h-[calc(var(--navbar-height)_-_1rem)] max-w-md items-stretch gap-1 rounded-3xl border border-border/70 bg-card/95 p-1 shadow-xl backdrop-blur-xl"
        >
          <RouterLink :to="{ name: 'home' }" :class="tabItemClass">
            <IconHome size="1.5rem" />
            <span :class="tabLabelClass">الرئيسية</span>
          </RouterLink>
          <RouterLink :to="{ name: 'quran' }" :class="cn(tabItemClass, isQuranActive && tabItemActiveClass)">
            <IconBook size="1.5rem" />
            <span :class="tabLabelClass">القرآن</span>
          </RouterLink>
          <RouterLink :to="{ name: 'azkar' }" :class="cn(tabItemClass, isAzkarActive && tabItemActiveClass)">
            <IconSparkles size="1.5rem" />
            <span :class="tabLabelClass">الأذكار</span>
          </RouterLink>
          <RouterLink :to="{ name: 'radio' }" :class="cn(tabItemClass, isRadioActive && tabItemActiveClass)">
            <span class="relative flex">
              <IconRadio size="1.5rem" />
              <span
                v-if="radio.isPlaying"
                class="radio-status absolute -top-0.5 -end-0.5 size-2 rounded-full bg-destructive ring-2 ring-card"
              />
            </span>
            <span :class="tabLabelClass">الإذاعة</span>
          </RouterLink>
          <DrawerTrigger as-child>
            <button type="button" :class="tabItemClass">
              <IconDotsCircleHorizontal size="1.5rem" />
              <span :class="tabLabelClass">المزيد</span>
            </button>
          </DrawerTrigger>
        </div>
      </nav>
      <!-- More Menu -->
      <DrawerContent
        class="bg-popover text-popover-foreground shadow-xl data-[swipe-direction=down]:max-h-[70dvh] data-[swipe-direction=down]:rounded-t-3xl"
      >
        <DrawerHeader class="flex-row items-center justify-between px-4 pt-2 pb-1">
          <DrawerTitle class="font-serif text-xl font-medium">المزيد</DrawerTitle>
          <DrawerClose as-child>
            <Button variant="ghost" size="icon" type="button" class="size-11 rounded-full" aria-label="إغلاق">
              <IconX size="1.25rem" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div class="min-h-0 overflow-y-auto px-3 pt-1 pb-[calc(1rem_+_env(safe-area-inset-bottom,0px))]">
          <RouterLink :to="{ name: 'qibla' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            <span :class="moreMenuIconClass">
              <IconCompass size="1.25rem" />
            </span>
            اتجاه القبلة
            <IconChevronLeft class="ms-auto size-4 shrink-0 text-muted-foreground" />
          </RouterLink>
          <RouterLink :to="{ name: 'zakat' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            <span :class="moreMenuIconClass">
              <IconCoins size="1.25rem" />
            </span>
            حاسبة الزكاة
            <IconChevronLeft class="ms-auto size-4 shrink-0 text-muted-foreground" />
          </RouterLink>
          <RouterLink :to="{ name: 'sebha' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            <span :class="moreMenuIconClass">
              <IconCircleDotted size="1.25rem" />
            </span>
            السبحة الإلكترونية
            <IconChevronLeft class="ms-auto size-4 shrink-0 text-muted-foreground" />
          </RouterLink>
          <RouterLink :to="{ name: 'settings' }" :class="moreMenuItemClass" @click="closeMoreMenu">
            <span :class="moreMenuIconClass">
              <IconSettings size="1.25rem" />
            </span>
            الإعدادات
            <IconChevronLeft class="ms-auto size-4 shrink-0 text-muted-foreground" />
          </RouterLink>
          <Separator class="my-3" />
          <a href="https://t.me/rafeeqme" target="_blank" :class="moreMenuItemClass" @click="closeMoreMenu">
            <span :class="moreMenuIconClass">
              <IconBrandTelegram size="1.25rem" />
            </span>
            قناة التليجرام
            <IconChevronLeft class="ms-auto size-4 shrink-0 text-muted-foreground" />
          </a>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>
<style scoped>
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
