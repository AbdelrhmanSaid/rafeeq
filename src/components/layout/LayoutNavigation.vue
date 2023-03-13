<script lang="ts" setup>
import {
  IconCategory,
  IconPray,
  IconBookmarks,
  IconBook,
  IconRadio,
} from '@tabler/icons-vue'

const menu = [
  {
    path: '/',
    name: 'الرئيسية',
    icon: IconCategory,
  },
  {
    path: '/',
    name: 'الأذكار',
    icon: IconPray,
  },
  {
    path: '/',
    name: 'المحفوظات',
    icon: IconBookmarks,
  },
  {
    path: '/',
    name: 'المصحف',
    icon: IconBook,
  },
  {
    path: '/',
    name: 'الراديو',
    icon: IconRadio,
  },
]
</script>

<template>
  <header>
    <nav>
      <RouterLink v-for="item in menu" :key="item.path" :to="item.path">
        <component :is="item.icon" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
nav {
  @apply fixed bottom-0 left-0 w-full h-20 flex;
  @apply bg-white border-t border-gray-200;

  a {
    @apply flex flex-col justify-center items-center w-1/5;
    @apply text-teal-600 transition-colors duration-300 ease-in-out;

    &:hover,
    &.active {
      @apply bg-gray-100 text-teal-900 border-teal-800;
    }

    span {
      @apply mt-1 text-xs;
    }

    svg {
      stroke-width: 1.2;
    }
  }

  &::before {
    @apply absolute bottom-0 left-0 w-full h-1;
    @apply bg-teal-900;
    content: '';
  }
}

@media screen and (min-width: 576px) {
  nav {
    padding: 0 calc((100vw - 576px) / 2);
  }
}
</style>
