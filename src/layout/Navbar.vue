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
} from '@tabler/icons-vue'

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

const navLinkClass =
  'flex items-center gap-2 rounded-md px-3 py-2 font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&.router-link-active]:bg-accent [&.router-link-active]:text-accent-foreground'

const navLinkActiveClass = 'bg-accent text-accent-foreground'
</script>

<template>
  <!-- min-h (not h) so taller content at large font scales grows the bar
       instead of clipping. -->
  <nav class="sticky top-0 z-30 min-h-[var(--navbar-height)] border-b bg-background py-3">
    <div class="container-page flex flex-wrap items-center">
      <!-- The logo is a single-color mark; in dark mode it is flattened to white. -->
      <RouterLink to="/" class="dark:brightness-0 dark:invert">
        <Logo />
      </RouterLink>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        class="ms-auto lg:hidden"
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
        <ul class="mt-3 mb-2 flex flex-col gap-2 lg:mt-0 lg:mb-0 lg:ms-3 lg:me-auto lg:flex-row">
          <li>
            <RouterLink :to="{ name: 'home' }" :class="navLinkClass">
              <IconHome size="1.25rem" />
              <span>الرئيسية</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink :to="{ name: 'quran' }" :class="[navLinkClass, isQuranActive && navLinkActiveClass]">
              <IconBook size="1.25rem" />
              <span>القرآن الكريم</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink :to="{ name: 'azkar' }" :class="[navLinkClass, isAzkarActive && navLinkActiveClass]">
              <IconSparkles size="1.25rem" />
              <span>الأذكار</span>
            </RouterLink>
          </li>

          <li>
            <RouterLink :to="{ name: 'radio' }" :class="[navLinkClass, isRadioActive && navLinkActiveClass]">
              <IconRadio size="1.25rem" />
              <span>الإذاعة</span>
              <span v-if="radio.isPlaying" class="radio-status ms-2 inline-block size-2 rounded-full bg-destructive" />
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

              <DropdownMenuContent align="start" class="w-48">
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'zakat' }" class="w-full cursor-pointer">حاسبة الزكاة</RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'sebha' }" class="w-full cursor-pointer">السبحة الإلكترونية</RouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <RouterLink :to="{ name: 'settings' }" class="w-full cursor-pointer">الإعدادات</RouterLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>

        <ul class="flex flex-col gap-2 lg:ms-auto lg:flex-row">
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
