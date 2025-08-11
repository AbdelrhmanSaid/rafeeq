<script setup>
import FajrIcon from '@/components/icons/Prayers/Fajr.vue'
import DuhurIcon from '@/components/icons/Prayers/Duhur.vue'
import MaghribIcon from '@/components/icons/Prayers/Maghrib.vue'
import IshaaIcon from '@/components/icons/Prayers/Ishaa.vue'
import { IconArrowBarToUp, IconArrowBarToDown } from '@tabler/icons-vue'

const prayers = [
  {
    name: 'الفجر',
    before: 2,
    after: '-',
    icon: FajrIcon,
  },
  {
    name: 'الظهر',
    before: 4,
    after: 4,
    icon: DuhurIcon,
  },
  {
    name: 'المغرب',
    before: '-',
    after: 2,
    icon: MaghribIcon,
  },
  {
    name: 'العشاء',
    before: '-',
    after: 2,
    icon: IshaaIcon,
  },
]

const formatRakaa = (value) => {
  if (value === '-') return '-'
  if (value === 2) return 'ركعتان'
  return `${value} ركعات`
}
</script>

<template>
  <div class="row row-cols-2 row-cols-lg-4 g-2">
    <div v-for="(prayer, index) in prayers" :key="index" class="col">
      <div class="card h-100">
        <div class="card-body d-flex align-items-start gap-2 p-2">
          <span class="icon-container">
            <component :is="prayer.icon" />
          </span>
          <div class="flex-grow-1">
            <h5 class="card-title mb-2 fs-5">{{ prayer.name }}</h5>
            <div class="stacked-info small">
              <div class="info-block">
                <span class="info-label">
                  <IconArrowBarToUp />
                  قبل
                </span>
                <span class="info-value">{{ formatRakaa(prayer.before) }}</span>
              </div>
              <div class="info-block">
                <span class="info-label">
                  <IconArrowBarToDown />
                  بعد
                </span>
                <span class="info-value">{{ formatRakaa(prayer.after) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>

.icon-container {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid var(--bs-border-color);

  :deep(svg) {
    width: 20px;
    height: 20px;
    color: var(--bs-primary);
  }
}

.stacked-info {
  display: grid;
  gap: 4px;
}

.info-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background-color: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
}

.info-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--bs-secondary-color);

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.info-value {
  font-weight: 600;
}
</style>
