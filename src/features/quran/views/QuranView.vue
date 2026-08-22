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

// Each row positions itself so the surah link can stretch an overlay across the
// whole row; the favourite button stays clickable above it (it is raised).
const rowClass = () => 'relative'
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
      class="mb-4 flex w-full items-center gap-3 rounded-md border bg-primary/5 p-4 transition-colors hover:border-primary/50 hover:bg-primary/10"
    >
      <IconBookmark class="shrink-0 text-primary" size="22" />
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-sm text-muted-foreground">متابعة القراءة</span>
        <span class="font-semibold">{{ bookmark.surahName }} - آية {{ toArabicNumerals(bookmark.ayahNumber) }}</span>
        <span v-if="bookmark.text" class="truncate text-base font-quran">{{ bookmark.text }}</span>
      </span>
      <IconChevronLeft class="shrink-0 text-muted-foreground" size="20" />
    </RouterLink>

    <SearchableFavoritesList
      :items="surahs"
      item-key="id"
      :favorites-key="STORAGE_KEYS.quranFavorites"
      placeholder="ابحث بالسورة"
      label="تبحث عن سورة معينة؟"
      :item-class="rowClass"
    >
      <template #favorites-title>
        <h5 class="mb-3 text-lg">السور المفضلة</h5>
      </template>

      <template #all-title>
        <h5 class="mb-3 text-lg">كل السور</h5>
      </template>

      <template #default="{ item }">
        <RouterLink :to="{ name: 'quran-surah', params: { surah: item.id } }" class="after:absolute after:inset-0">
          <p class="flex flex-col">
            <span>{{ toArabicNumerals(item.id) }}. {{ item.name }}</span>
            <small class="text-sm">
              عدد الآيات: {{ toArabicNumerals(item.numberOfAyahs) }} - {{ item.isMeccan ? 'مكية' : 'مدنية' }}
            </small>
          </p>
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>
