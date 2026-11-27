<script setup>
import { computed } from 'vue'
import LoadingState from '@/shared/ui/LoadingState.vue'
import { formatAyahCount } from '@/features/quran/lib/mushaf'
import { toArabicNumerals } from '@/shared/utils/arabic'

const props = defineProps({
  // What useAyahSearch returns, made reactive.
  results: { type: Object, required: true },
})

const groups = computed(() =>
  [
    { title: 'الآيات', count: props.results.exactCount, rows: props.results.exact },
    { title: 'نتائج مقاربة', count: props.results.closeCount, rows: props.results.close },
  ].filter((group) => group.rows.length),
)
</script>

<template>
  <div v-if="results.isLoading || results.failed || results.total" class="ayah-results">
    <LoadingState v-if="results.isLoading" message="جاري تجهيز البحث في الآيات..." />

    <p v-else-if="results.failed" class="ayah-results__note" role="status">
      تعذّر تحميل نص القرآن للبحث في الآيات. تحقق من اتصالك ثم حاول مرة أخرى.
    </p>

    <template v-else>
      <section v-for="group in groups" :key="group.title" class="ayah-results__group">
        <h2 class="list-title d-flex justify-content-between align-items-baseline gap-3">
          <span>{{ group.title }}</span>
          <small class="ayah-results__count">{{ formatAyahCount(group.count) }}</small>
        </h2>

        <ul class="list-group">
          <li v-for="row in group.rows" :key="row.key" class="list-group-item list-group-item-action ayah-row">
            <RouterLink
              :to="{ name: 'quran-page', params: { page: row.page }, query: { ayah: row.key } }"
              class="stretched-link text-decoration-none text-reset d-block"
            >
              <p class="ayah-row__text font-quran">
                <span v-if="row.clippedStart">… </span>
                <template v-for="(segment, index) in row.segments" :key="index">
                  <mark v-if="segment.hit">{{ segment.text }}</mark>
                  <span v-else>{{ segment.text }}</span>
                </template>
                <span v-if="row.clippedEnd"> …</span>
              </p>
              <span class="d-flex justify-content-between align-items-baseline gap-3">
                <span class="fw-medium">{{ row.title }}</span>
                <small class="text-body-secondary">صفحة {{ toArabicNumerals(row.page) }}</small>
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <button v-if="results.hasMore" type="button" class="btn btn-flat w-100 mt-3" @click="results.showMore()">
        عرض المزيد
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.ayah-results:not(:first-child),
.ayah-results__group + .ayah-results__group {
  margin-top: 1.5rem;
}

.ayah-results__count {
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 400;
}

.ayah-results__note {
  margin: 0;
  color: var(--bs-secondary-color);
  text-align: center;
}

.ayah-row {
  --bs-list-group-action-color: var(--bs-body-color);
}

.ayah-row__text {
  margin: 0 0 0.25rem;
  font-size: 1.375rem;
  line-height: 2;

  mark {
    padding: 0 0.15em;
    border-radius: 0.3rem;
    background: color-mix(in srgb, var(--bs-primary) 20%, transparent);
    color: inherit;
    // A match that wraps keeps its rounded ends on both lines.
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
}

[data-bs-theme='dark'] .ayah-row__text mark {
  background: color-mix(in srgb, var(--bs-primary) 38%, transparent);
}
</style>
