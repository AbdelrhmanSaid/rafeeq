<script setup>
import { IconBookmark, IconChevronLeft } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import surahs from '@/features/quran/data/surahs.js'
import { useQuranBookmark } from '@/features/quran/composables/useQuranBookmark'
import { toArabicNumerals, normalizeQuranicText } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const { bookmark } = useQuranBookmark()

// Arabic counts ending in 3–10 (7, 103, 110) take the plural آيات; the rest (11, 99, 200) take the singular آية.
const formatAyahCount = (count) => {
  const lastTwo = count % 100
  return `${toArabicNumerals(count)} ${lastTwo >= 3 && lastTwo <= 10 ? 'آيات' : 'آية'}`
}
</script>

<template>
  <Page>
    <Heading
      subtitle-desktop-only
      title="القرآن الكريم"
      subtitle="إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه."
      :share="true"
    />

    <RouterLink
      v-if="bookmark"
      :to="{ name: 'quran-surah', params: { surah: bookmark.surahId }, query: { ayah: bookmark.ayahNumber } }"
      class="bookmark-card"
    >
      <IconBookmark class="bookmark-card__icon" size="22" />
      <span class="bookmark-card__body">
        <span class="bookmark-card__label">متابعة القراءة</span>
        <span class="bookmark-card__title"
          >{{ normalizeQuranicText(bookmark.surahName) }} - آية {{ toArabicNumerals(bookmark.ayahNumber) }}</span
        >
        <span v-if="bookmark.text" class="bookmark-card__text font-quran">{{ bookmark.text }}</span>
      </span>
      <IconChevronLeft class="bookmark-card__chevron" size="20" />
    </RouterLink>

    <SearchableFavoritesList
      :items="surahs"
      item-key="id"
      :favorites-key="STORAGE_KEYS.quranFavorites"
      placeholder="ابحث بالسورة"
      label="تبحث عن سورة معينة؟"
    >
      <template #favorites-title>
        <h2 class="list-title">السور المفضلة</h2>
      </template>

      <template #all-title>
        <h2 class="list-title">كل السور</h2>
      </template>

      <template #default="{ item }">
        <RouterLink
          :to="{ name: 'quran-surah', params: { surah: item.id } }"
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
  </Page>
</template>

<style lang="scss" scoped>
/* One line per surah: the details sit at the end of the row, before the heart. */
.surah-meta {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.375rem;
  margin-inline-start: auto;
  white-space: nowrap;
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

  &__text {
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--bs-secondary-color);
  }
}
</style>
