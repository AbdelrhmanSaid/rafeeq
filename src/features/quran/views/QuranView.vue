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
  readingSurahOfPage,
  surahName,
  surahStartPage,
} from '@/features/quran/lib/mushaf'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const quranStore = useQuranStore()
const { bookmarks, removeBookmark } = useQuranBookmarks()

const lastPage = computed(() => {
  const page = Number(quranStore.lastPage)
  return isPage(page) ? { page, surah: surahName(readingSurahOfPage(page)) } : null
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

    <SearchableFavoritesList
      :items="surahs"
      item-key="id"
      :favorites-key="STORAGE_KEYS.quranFavorites"
      placeholder="ابحث بالسورة"
      label="تبحث عن سورة معينة؟"
      :item-label="(item) => surahName(item.id)"
    >
      <!-- Under the search: where reading was left, and the bookmarks. A search puts its results right under it. -->
      <template #before-list="{ search }">
        <template v-if="!search">
          <section v-if="lastPage" class="mb-4">
            <h2 class="list-title">متابعة القراءة</h2>
            <ul class="list-group">
              <li class="list-group-item list-group-item-action">
                <RouterLink
                  :to="{ name: 'quran-page', params: { page: lastPage.page } }"
                  class="stretched-link text-decoration-none text-reset d-flex align-items-center gap-3 min-w-0"
                >
                  <IconBook class="continue__icon" size="1.25rem" aria-hidden="true" />
                  <span class="surah-name fw-medium text-truncate">{{ lastPage.surah }}</span>
                  <small class="surah-meta text-body-secondary">صفحة {{ toArabicNumerals(lastPage.page) }}</small>
                  <IconChevronLeft class="continue__chevron" size="1.125rem" aria-hidden="true" />
                </RouterLink>
              </li>
            </ul>
          </section>

          <section v-if="bookmarkRows.length" class="mb-4">
            <h2 class="list-title">الإشارات المرجعية</h2>
            <ul class="list-group">
              <li
                v-for="row in bookmarkRows"
                :key="row.key"
                class="list-group-item list-group-item-action bookmark-row"
              >
                <div class="d-flex align-items-center gap-3">
                  <RouterLink
                    :to="{ name: 'quran-page', params: { page: row.page }, query: { ayah: row.key } }"
                    class="stretched-link text-decoration-none text-reset d-flex align-items-center gap-3 min-w-0 flex-grow-1"
                  >
                    <span class="bookmark-dot" :class="`mark-${row.color}`" aria-hidden="true"></span>
                    <span class="surah-name fw-medium text-truncate">{{ row.title }}</span>
                    <small class="surah-meta text-body-secondary">صفحة {{ toArabicNumerals(row.page) }}</small>
                  </RouterLink>
                  <button
                    type="button"
                    class="btn btn-flat btn-icon bookmark-row__remove position-relative z-1"
                    :aria-label="`إزالة الإشارة المرجعية ${row.title}`"
                    @click="removeBookmark(row.key)"
                  >
                    <IconX size="1.15rem" aria-hidden="true" />
                  </button>
                </div>
              </li>
            </ul>
          </section>
        </template>
      </template>

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
          <span class="surah-name fw-medium text-truncate">{{ surahName(item.id) }}</span>
          <small class="surah-meta text-body-secondary">
            <span>{{ item.isMeccan ? 'مكية' : 'مدنية' }}</span>
            <span class="surah-meta__dot" aria-hidden="true"></span>
            <span>{{ formatAyahCount(item.numberOfAyahs) }}</span>
          </small>
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>

<style lang="scss" scoped>
/* One line per surah, named without "سورة" like the rest of the Quran screens. The name comes first: the details at
   the end of the row give way, then trail off, before the name is ever cut. */
.surah-name {
  flex-shrink: 0;
  max-width: calc(100% - 2.75rem);
}

.surah-meta {
  display: block;
  min-width: 0;
  margin-inline-start: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* A drawn dot, since a "·" beside Arabic numerals reads as the digit zero (٠). */
.surah-meta__dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  margin-inline: 0.375rem;
  border-radius: 50%;
  background: currentColor;
  vertical-align: middle;
}

/* As compact as the surah rows: the 44px remove button sets the height and sits out at the row's end. */
.bookmark-row {
  padding-block: 0.375rem;
}

.bookmark-row__remove {
  flex-shrink: 0;
  margin-inline-end: -0.75rem;
  border-radius: 50%;
  color: var(--bs-secondary-color);
}

.bookmark-dot {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--mark-solid);
}

.continue__icon {
  flex-shrink: 0;
  color: var(--app-primary-ink);
}

.continue__chevron {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
}
</style>
