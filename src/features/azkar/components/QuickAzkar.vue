<script setup>
import { RouterLink } from 'vue-router'
import { IconSun, IconMoon, IconShield, IconDots } from '@tabler/icons-vue'

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
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
    <div v-for="item in azkar" :key="item.slug" class="col">
      <div class="card h-100 position-relative">
        <div class="card-body d-flex align-items-center gap-3">
          <span class="icon-circle text-secondary">
            <component :is="item.icon" />
          </span>
          <div>
            <h3 class="card-title fs-5 mb-1">{{ item.name }}</h3>
            <small class="text-body-secondary">{{ item.description }}</small>
          </div>
        </div>
        <RouterLink :to="{ name: 'azkar-category', params: { category: item.slug } }" class="stretched-link" />
      </div>
    </div>

    <div class="col">
      <div class="card h-100 position-relative">
        <div class="card-body d-flex align-items-center gap-3">
          <span class="icon-circle text-secondary">
            <IconDots />
          </span>
          <div>
            <h3 class="card-title fs-5 mb-1">المزيد</h3>
            <small class="text-body-secondary">اضغط هنا لعرض كل الأذكار المتاحة</small>
          </div>
        </div>
        <RouterLink :to="{ name: 'azkar' }" class="stretched-link" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    background-color: rgba(var(--bs-secondary-rgb), 0.1);
  }

  /* The card itself carries the focus ring for the stretched link. */
  &:focus-within {
    box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
  }

  .stretched-link:focus {
    outline: none;
  }
}
</style>
