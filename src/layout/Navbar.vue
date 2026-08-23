<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useRadioStore } from '@/features/radio/store'
import { useActiveNav } from '@/layout/useActiveNav'

import {
  IconHome,
  IconBook,
  IconSparkles,
  IconRadio,
  IconDotsCircleHorizontal,
  IconBrandTelegram,
  IconMenu2,
  IconCoins,
  IconCircleDotted,
  IconSettings,
} from '@tabler/icons-vue'

import { cn } from '@/shared/lib/utils'

import Logo from '@/shared/ui/Logo.vue'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

const radio = useRadioStore()
const route = useRoute()
const { isQuranActive, isAzkarActive, isRadioActive } = useActiveNav()

// The narrow-width menu is Vue state now that Bootstrap's collapse JS is gone,
// so it has to close itself on navigation instead of being force-closed by the
// router guard.
const isMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  },
)

// Destinations are quiet pills: muted until hovered, washed with the
// (user-themeable) accent once active. `min-h-11` keeps them a 44px target on
// the tablet-width stacked menu.
const navLinkClass =
  'flex min-h-11 items-center gap-2 rounded-full px-3.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.router-link-active]:bg-primary/12 [&.router-link-active]:text-primary'

// Merged with cn() at the call sites: the detail-route active state has to beat
// the base `text-muted-foreground`, and plain concatenation would leave the
// winner up to the order Tailwind happens to emit the two utilities in.
const navLinkActiveClass = 'bg-primary/12 text-primary'

const menuItemClass = 'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3'
</script>

<template>
  <!-- min-h (not h) so taller content at large font scales grows the bar
       instead of clipping. The bar is translucent so content scrolling under it
       stays hinted at rather than cut off. -->
  <nav
    class="sticky top-0 z-30 min-h-[var(--navbar-height)] border-b border-border/70 bg-background/85 py-3 backdrop-blur-xl"
  >
    <div class="container-page flex flex-wrap items-center">
      <!-- The logo is a single-color mark; in dark mode it is flattened to white. -->
      <RouterLink to="/" class="flex shrink-0 items-center dark:brightness-0 dark:invert">
        <Logo :size="36" />
      </RouterLink>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        class="ms-auto size-11 rounded-full lg:hidden"
        aria-controls="menu"
        aria-label="القائمة"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <IconMenu2 class="size-6" />
      </Button>

      <div
        id="menu"
        class="w-full lg:flex lg:w-auto lg:flex-1 lg:items-center"
        :class="isMenuOpen ? 'block' : 'hidden'"
      >
        <ul class="mt-3 mb-2 flex flex-col gap-1 lg:mt-0 lg:mb-0 lg:ms-4 lg:me-auto lg:flex-row">
          <li>
            <RouterLink :to="{ name: 'home' }" :class="navLinkClass">
              <IconHome size="1.25rem" />
              <span>الرئيسية</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink :to="{ name: 'quran' }" :class="cn(navLinkClass, isQuranActive && navLinkActiveClass)">
              <IconBook size="1.25rem" />
              <span>القرآن الكريم</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink :to="{ name: 'azkar' }" :class="cn(navLinkClass, isAzkarActive && navLinkActiveClass)">
              <IconSparkles size="1.25rem" />
              <span>الأذكار</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink :to="{ name: 'radio' }" :class="cn(navLinkClass, isRadioActive && navLinkActiveClass)">
              <IconRadio size="1.25rem" />
              <span>الإذاعة</span>
              <span v-if="radio.isPlaying" class="radio-status ms-1 inline-block size-2 rounded-full bg-destructive" />
            </RouterLink>
          </li>

          <li>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button type="button" class="cursor-pointer" :class="navLinkClass">
                  <IconDotsCircleHorizontal size="1.25rem" />
                  <span>المزيد</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" class="w-56 rounded-2xl p-1.5 shadow-xl">
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'zakat' }" :class="menuItemClass">
                    <IconCoins size="1.125rem" />
                    حاسبة الزكاة
                  </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'sebha' }" :class="menuItemClass">
                    <IconCircleDotted size="1.125rem" />
                    السبحة الإلكترونية
                  </RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'settings' }" :class="menuItemClass">
                    <IconSettings size="1.125rem" />
                    الإعدادات
                  </RouterLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>

        <ul class="flex flex-col gap-1 lg:ms-auto lg:flex-row">
          <li>
            <a href="https://telegram.me/rafeeqme" target="_blank" :class="navLinkClass">
              <IconBrandTelegram size="1.25rem" />
              <span>قناة التليجرام</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
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
