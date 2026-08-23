<script setup>
import { RouterLink } from 'vue-router'
import { IconSun, IconMoon, IconShield, IconDots, IconChevronLeft } from '@tabler/icons-vue'

const azkar = [
  {
    slug: 'morning',
    name: 'أذكار الصباح',
    description: 'وقتها من بعد الفجر حتى ارتفاع الشمس',
    icon: IconSun,
  },
  {
    slug: 'evening',
    name: 'أذكار المساء',
    description: 'وقتها من بعد العصر حتى غروب الشمس',
    icon: IconMoon,
  },
  {
    slug: 'ruqya',
    name: 'الرقية الشرعية',
    description: 'حصن نفسك بصحيح الرقية الشرعية',
    icon: IconShield,
  },
]

const rowClass = [
  'flex min-h-14 items-center gap-3 px-4 py-3 transition-colors',
  'hover:bg-accent/60 active:bg-accent',
  'focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:outline-none',
].join(' ')

const iconClass = 'grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary'
</script>
<template>
  <div class="divide-y overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm">
    <RouterLink
      v-for="item in azkar"
      :key="item.slug"
      :to="{ name: 'azkar-category', params: { category: item.slug } }"
      :class="rowClass"
      :aria-label="item.name"
    >
      <span :class="iconClass">
        <component :is="item.icon" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-medium">{{ item.name }}</h3>
        <p class="text-sm leading-relaxed text-muted-foreground">{{ item.description }}</p>
      </div>
      <IconChevronLeft class="size-4 shrink-0 text-muted-foreground" />
    </RouterLink>
    <RouterLink :to="{ name: 'azkar' }" :class="rowClass" aria-label="المزيد">
      <span :class="iconClass">
        <IconDots class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-medium">المزيد</h3>
        <p class="text-sm leading-relaxed text-muted-foreground">اضغط هنا لعرض كل الأذكار المتاحة</p>
      </div>
      <IconChevronLeft class="size-4 shrink-0 text-muted-foreground" />
    </RouterLink>
  </div>
</template>
