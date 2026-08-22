<script setup>
import { RouterLink } from 'vue-router'
import { IconSun, IconMoon, IconShield, IconDots } from '@tabler/icons-vue'
import { Card, CardContent } from '@/shared/components/ui/card'

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
</script>

<template>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
    <!-- The link is an overlay covering the whole tile, so the card itself
         carries the hover state and the focus ring for it. -->
    <Card
      v-for="item in azkar"
      :key="item.slug"
      class="relative h-full gap-0 py-0 transition-colors hover:bg-secondary focus-within:bg-secondary focus-within:ring-3 focus-within:ring-ring/50"
    >
      <CardContent class="flex items-center gap-3 p-4">
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full border text-muted-foreground [&_svg]:size-[1.15rem]"
        >
          <component :is="item.icon" />
        </span>
        <div>
          <h3 class="mb-1 text-xl">{{ item.name }}</h3>
          <span class="text-sm text-muted-foreground">{{ item.description }}</span>
        </div>
      </CardContent>

      <RouterLink
        :to="{ name: 'azkar-category', params: { category: item.slug } }"
        class="absolute inset-0 rounded-xl focus:outline-none"
        :aria-label="item.name"
      />
    </Card>

    <Card
      class="relative h-full gap-0 py-0 transition-colors hover:bg-secondary focus-within:bg-secondary focus-within:ring-3 focus-within:ring-ring/50"
    >
      <CardContent class="flex items-center gap-3 p-4">
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full border text-muted-foreground [&_svg]:size-[1.15rem]"
        >
          <IconDots />
        </span>
        <div>
          <h3 class="mb-1 text-xl">المزيد</h3>
          <span class="text-sm text-muted-foreground">اضغط هنا لعرض كل الأذكار المتاحة</span>
        </div>
      </CardContent>

      <RouterLink :to="{ name: 'azkar' }" class="absolute inset-0 rounded-xl focus:outline-none" aria-label="المزيد" />
    </Card>
  </div>
</template>
