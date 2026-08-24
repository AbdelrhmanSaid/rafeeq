<script setup>
import { RouterLink } from 'vue-router'
import { IconSun, IconMoon, IconShield, IconDots, IconChevronLeft } from '@tabler/icons-vue'

// Each shortcut carries its own accent so the row reads as a set of distinct
// moments (dawn, dusk, protection) instead of four identical tiles.
const azkar = [
  {
    slug: 'morning',
    name: 'أذكار الصباح',
    description: 'وقتها من بعد الفجر حتى ارتفاع الشمس',
    icon: IconSun,
    accent: '#d97706',
  },
  {
    slug: 'evening',
    name: 'أذكار المساء',
    description: 'وقتها من بعد العصر حتى غروب الشمس',
    icon: IconMoon,
    accent: '#4f46e5',
  },
  {
    slug: 'ruqya',
    name: 'الرقية الشرعية',
    description: 'حصن نفسك بصحيح الرقية الشرعية',
    icon: IconShield,
    accent: '#059669',
  },
]
</script>

<template>
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
    <div v-for="item in azkar" :key="item.slug" class="col">
      <div class="card card-interactive h-100 position-relative quick-card" :style="{ '--accent': item.accent }">
        <div class="card-body d-flex align-items-center gap-3">
          <span class="icon-circle icon-circle--lg quick-card__icon">
            <component :is="item.icon" />
          </span>
          <div class="min-w-0 flex-grow-1">
            <h3 class="card-title fs-5 mb-1">{{ item.name }}</h3>
            <small class="text-body-secondary d-block">{{ item.description }}</small>
          </div>
          <IconChevronLeft class="quick-card__chevron" size="1.1rem" aria-hidden="true" />
        </div>
        <RouterLink :to="{ name: 'azkar-category', params: { category: item.slug } }" class="stretched-link" />
      </div>
    </div>

    <div class="col">
      <div class="card card-interactive h-100 position-relative quick-card quick-card--more">
        <div class="card-body d-flex align-items-center gap-3">
          <span class="icon-circle icon-circle--lg quick-card__icon">
            <IconDots />
          </span>
          <div class="min-w-0 flex-grow-1">
            <h3 class="card-title fs-5 mb-1">كل الأذكار</h3>
            <small class="text-body-secondary d-block">تصفح جميع الأبواب المتاحة</small>
          </div>
          <IconChevronLeft class="quick-card__chevron" size="1.1rem" aria-hidden="true" />
        </div>
        <RouterLink :to="{ name: 'azkar' }" class="stretched-link" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quick-card {
  --accent: var(--bs-primary);
  overflow: hidden;

  /* Soft accent wash in the corner behind the icon. */
  &::after {
    content: '';
    position: absolute;
    inset-inline-start: -3rem;
    top: -3rem;
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
    background: radial-gradient(closest-side, color-mix(in srgb, var(--accent) 14%, transparent), transparent);
    pointer-events: none;
    transition: transform 0.35s var(--app-ease);
  }

  &:hover::after,
  &:focus-within::after {
    transform: scale(1.35);
  }

  &--more {
    --accent: var(--bs-primary);
    border-style: dashed;
    box-shadow: none;
  }
}

.quick-card__icon {
  color: var(--accent);
}

.quick-card__chevron {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
  opacity: 0.6;
  transition:
    transform 0.25s var(--app-ease),
    opacity 0.2s ease;

  .quick-card:hover &,
  .quick-card:focus-within & {
    opacity: 1;
    transform: translateX(-3px);
    color: var(--accent);
  }
}

[dir='ltr'] .quick-card__chevron {
  transform: scaleX(-1);

  .quick-card:hover &,
  .quick-card:focus-within & {
    transform: scaleX(-1) translateX(-3px);
  }
}
</style>
