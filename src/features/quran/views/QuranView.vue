<script setup>
import { computed } from 'vue'
import { IconBook, IconChevronLeft, IconX } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import surahs from '@/features/quran/data/surahs.js'
import { useQuranStore } from '@/features/quran/store'
import { useQuranBookmarks } from '@/features/quran/composables/useQuranBookmarks'
import {
  formatAyahCount,
  isPage,
  pageOfAyah,
  parseVerseKey,
  surahName,
  surahOfPage,
  surahStartPage,
} from '@/features/quran/lib/mushaf'
import { toArabicNumerals, normalizeQuranicText } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const quranStore = useQuranStore()
const { bookmarks, removeBookmark } = useQuranBookmarks()

// Where the reader was left, so the Quran opens one tap away from it.
const lastPage = computed(() => {
  const page = Number(quranStore.lastPage)
  return isPage(page) ? { page, surah: surahName(surahOfPage(page)) } : null
})

const bookmarkRows = computed(() =>
  bookmarks.value.map((bookmark) => {
    const { surah, ayah } = parseVerseKey(bookmark.key)
    return {
      ...bookmark,
      title: `${surahName(surah)} ${toArabicNumerals(ayah)}`,
      page: pageOfAyah(surah, ayah),
    }
  }),
)
</script>

<template>
  <Page>
    <Heading
      subtitle-desktop-only
      title="القرآن الكريم"
      subtitle="إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه."
      :share="true"
    />

    <RouterLink v-if="lastPage" :to="{ name: 'quran-page', params: { page: lastPage.page } }" class="bookmark-card">
      <IconBook class="bookmark-card__icon" size="22" aria-hidden="true" />
      <span class="bookmark-card__body">
        <span class="bookmark-card__label">متابعة القراءة</span>
        <span class="bookmark-card__title">{{ lastPage.surah }} - صفحة {{ toArabicNumerals(lastPage.page) }}</span>
      </span>
      <IconChevronLeft class="bookmark-card__chevron" size="20" aria-hidden="true" />
    </RouterLink>

    <section v-if="bookmarkRows.length" class="mb-4">
      <h2 class="list-title">الإشارات المرجعية</h2>
      <ul class="list-group">
        <li v-for="row in bookmarkRows" :key="row.key" class="list-group-item list-group-item-action">
          <div class="d-flex align-items-center gap-3">
            <RouterLink
              :to="{ name: 'quran-page', params: { page: row.page }, query: { ayah: row.key } }"
              class="stretched-link text-decoration-none text-reset d-flex align-items-center gap-3 min-w-0 flex-grow-1"
            >
              <span class="bookmark-dot" :class="`mark-${row.color}`" aria-hidden="true"></span>
              <span class="fw-medium text-truncate">{{ row.title }}</span>
              <small class="surah-meta text-body-secondary">صفحة {{ toArabicNumerals(row.page) }}</small>
            </RouterLink>
            <button
              type="button"
              class="btn btn-flat btn-icon position-relative z-1"
              :aria-label="`إزالة الإشارة المرجعية ${row.title}`"
              @click="removeBookmark(row.key)"
            >
              <IconX size="1.15rem" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
    </section>

    <SearchableFavoritesList
      :items="surahs"
      item-key="id"
      :favorites-key="STORAGE_KEYS.quranFavorites"
      placeholder="ابحث بالسورة"
      label="تبحث عن سورة معينة؟"
      :item-label="(item) => normalizeQuranicText(item.name)"
    >
      <template #favorites-title>
        <h2 class="list-title">السور المفضلة</h2>
      </template>

      <template #all-title>
        <h2 class="list-title">كل السور</h2>
      </template>

      <template #default="{ item }">
        <RouterLink
          :to="{ name: 'quran-page', params: { page: surahStartPage(item.id) } }"
          class="stretched-link text-decoration-none text-reset d-flex align-items-center gap-3 min-w-0 flex-grow-1"
        >
          <span class="list-index">{{ toArabicNumerals(item.id) }}</span>
          <span class="fw-medium text-truncate">{{ normalizeQuranicText(item.name) }}</span>
          <small class="surah-meta text-body-secondary">
            <span>{{ item.isMeccan ? 'مكية' : 'مدنية' }}</span>
            <span class="surah-meta__dot" aria-hidden="true"></span>
            <span>{{ formatAyahCount(item.numberOfAyahs) }}</span>
          </small>
        </RouterLink>
      </template>
    </SearchableFavoritesList>

    <p class="mushaf-credit">مصحف المدينة المنورة بخطوط مجمع الملك فهد لطباعة المصحف الشريف، عبر Quran.com.</p>
  </Page>
</template>

<style lang="scss" scoped>
.mushaf-credit {
  margin: 1.5rem 0 0;
  font-size: 0.8125rem;
  color: var(--bs-secondary-color);
  text-align: center;
}

/* One line per surah: the details sit at the end of the row, before the heart. */
.surah-meta {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.375rem;
  margin-inline-start: auto;
  white-space: nowrap;
}

/* A bookmark's color, as on its ayah in the Mushaf. */
.bookmark-dot {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--mark-solid);
}

/* A drawn dot, since a "·" beside Arabic numerals reads as the digit zero (٠). */
.surah-meta__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
}

.bookmark-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid var(--app-hairline);
  border-radius: var(--bs-border-radius-lg);
  background-color: color-mix(in srgb, var(--bs-primary) 6%, var(--app-surface));
  box-shadow: var(--app-shadow-card);
  color: var(--bs-body-color);
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: color-mix(in srgb, var(--bs-primary) 10%, var(--app-surface));
      border-color: var(--app-hairline-strong);
    }
  }

  &__icon {
    flex-shrink: 0;
    color: var(--bs-primary);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    flex: 1;
  }

  &__label {
    font-size: 0.85rem;
    color: var(--bs-secondary-color);
  }

  &__title {
    font-weight: 600;
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--bs-secondary-color);
  }
}
</style>
