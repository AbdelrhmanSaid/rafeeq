<script setup>
import { IconBookmark, IconChevronLeft } from '@tabler/icons-vue'
import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import surahs from '@/features/quran/data/surahs.js'
import { useQuranBookmark } from '@/features/quran/composables/useQuranBookmark'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const { bookmark } = useQuranBookmark()
</script>

<template>
  <Page>
    <Heading
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
          >{{ bookmark.surahName }} - آية {{ toArabicNumerals(bookmark.ayahNumber) }}</span
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
        <h5 class="mb-3">السور المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3">كل السور</h5>
      </template>

      <template #default="{ item }">
        <RouterLink
          :to="{ name: 'quran-surah', params: { surah: item.id } }"
          class="stretched-link text-decoration-none text-reset"
        >
          <p class="d-flex flex-column m-0">
            <span>{{ toArabicNumerals(item.id) }}. {{ item.name }}</span>
            <small>
              عدد الآيات: {{ toArabicNumerals(item.numberOfAyahs) }} - {{ item.isMeccan ? 'مكية' : 'مدنية' }}
            </small>
          </p>
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>

<style lang="scss" scoped>
.bookmark-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  background-color: rgba(var(--bs-primary-rgb), 0.06);
  color: var(--bs-body-color);
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.12);
    border-color: rgba(var(--bs-primary-rgb), 0.5);
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
    font-size: 0.8rem;
    color: var(--bs-secondary-color);
  }

  &__title {
    font-weight: 600;
  }

  &__text {
    font-size: 1.1rem;
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
