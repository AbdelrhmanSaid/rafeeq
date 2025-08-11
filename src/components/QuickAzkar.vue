<script setup>
import { RouterLink } from 'vue-router'
import { IconSun, IconMoon, IconShield, IconDots } from '@tabler/icons-vue'

const azkar = [
  {
    id: 1,
    name: 'أذكار الصباح',
    description: 'وقتها من بعد الفجر حتى ارتفاع الشمس',
    icon: IconSun,
  },
  {
    id: 2,
    name: 'أذكار المساء',
    description: 'وقتها من بعد العصر حتى غروب الشمس',
    icon: IconMoon,
  },
  {
    id: 3,
    name: 'الرقية الشرعية',
    description: 'حصن نفسك بصحيح الرقية الشرعية',
    icon: IconShield,
  },
]
</script>

<template>
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
    <div v-for="azkar in azkar" :key="azkar.id" class="col">
      <div class="card h-100 position-relative">
        <div class="card-body d-flex align-items-center gap-3">
          <span class="icon-container">
            <component :is="azkar.icon" />
          </span>
          <div>
            <h5 class="card-title mb-1">{{ azkar.name }}</h5>
            <small class="text-muted">{{ azkar.description }}</small>
          </div>
        </div>
        <RouterLink :to="{ name: 'azkar-category', params: { category: azkar.id } }" class="stretched-link" />
      </div>
    </div>

    <div class="col">
      <div class="card h-100 position-relative">
        <div class="card-body d-flex align-items-center gap-3">
          <span class="icon-container">
            <IconDots />
          </span>
          <div>
            <h5 class="card-title mb-1">المزيد</h5>
            <small class="text-muted">اضغط هنا لعرض كل الأذكار المتاحة</small>
          </div>
        </div>
        <RouterLink :to="{ name: 'azkar' }" class="stretched-link" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--bs-primary-bg-subtle);
  }
}
</style>
