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
</script>

<template>
  <div class="list-group">
    <RouterLink
      v-for="item in azkar"
      :key="item.slug"
      :to="{ name: 'azkar-category', params: { category: item.slug } }"
      class="list-group-item list-group-item-action quick-row"
    >
      <span class="quick-row__icon">
        <component :is="item.icon" size="1.25rem" />
      </span>
      <div class="min-w-0 flex-grow-1">
        <h3 class="quick-row__title">{{ item.name }}</h3>
        <small class="text-body-secondary d-block">{{ item.description }}</small>
      </div>
      <IconChevronLeft class="quick-row__chevron" size="1rem" aria-hidden="true" />
    </RouterLink>

    <RouterLink :to="{ name: 'azkar' }" class="list-group-item list-group-item-action quick-row">
      <span class="quick-row__icon">
        <IconDots size="1.25rem" />
      </span>
      <div class="min-w-0 flex-grow-1">
        <h3 class="quick-row__title">كل الأذكار</h3>
        <small class="text-body-secondary d-block">تصفح جميع الأبواب المتاحة</small>
      </div>
      <IconChevronLeft class="quick-row__chevron" size="1rem" aria-hidden="true" />
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.quick-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
}

.quick-row__icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--app-tint);
  color: var(--bs-primary);
}

[data-bs-theme='dark'] .quick-row__icon {
  color: color-mix(in srgb, var(--bs-primary) 35%, #fff);
}

.quick-row__title {
  margin-bottom: 0;
  font-size: 1rem;
  font-weight: 500;
}

.quick-row__chevron {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
  opacity: 0.6;
}

[dir='ltr'] .quick-row__chevron {
  transform: scaleX(-1);
}

@media screen and (min-width: 768px) {
  .list-group {
    flex-direction: row;
    gap: 0.75rem;
    box-shadow: none;

    .list-group-item {
      border: 1px solid var(--app-hairline);
      border-radius: var(--bs-list-group-border-radius);
    }
  }
}
</style>
