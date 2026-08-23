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

// Group labels above the two lists — quiet meta, so the surah names lead.
const groupTitleClass = 'mb-2 px-1 text-sm font-medium text-muted-foreground'
</script>

<template>
  <Page>
    <Heading
      title="القرآن الكريم"
      subtitle="إن له لحلاوة، وإن عليه لطلاوة، وإن أعلاه لمثمر، وإن أسفله لمغدق، وإنه يعلو ولا يعلى عليه."
      :share="true"
    />

    <!-- The one hero of this screen: pick the reading back up. It carries the
         accent wash so it reads as the shortcut, not another list row. -->
    <RouterLink
      v-if="bookmark"
      :to="{ name: 'quran-surah', params: { surah: bookmark.surahId }, query: { ayah: bookmark.ayahNumber } }"
      class="mb-6 flex w-full items-center gap-4 rounded-3xl p-4 shadow-sm transition duration-200 surface-hero active:scale-[0.99]"
    >
      <span class="grid size-12 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
        <IconBookmark class="size-6" />
      </span>

      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-xs text-muted-foreground">متابعة القراءة</span>
        <span class="truncate font-medium"
          >{{ bookmark.surahName }} - آية {{ toArabicNumerals(bookmark.ayahNumber) }}</span
        >
        <span v-if="bookmark.text" class="truncate text-base text-muted-foreground font-quran">
          {{ bookmark.text }}
        </span>
      </span>

      <IconChevronLeft class="size-5 shrink-0 text-muted-foreground" />
    </RouterLink>

    <SearchableFavoritesList
      :items="surahs"
      item-key="id"
      :favorites-key="STORAGE_KEYS.quranFavorites"
      placeholder="تبحث عن سورة معينة؟"
      :item-class="rowClass"
    >
      <template #favorites-title>
        <h2 :class="groupTitleClass">السور المفضلة</h2>
      </template>

      <template #all-title>
        <h2 :class="groupTitleClass">كل السور</h2>
      </template>

      <template #default="{ item }">
        <!-- The link stretches an overlay across the whole row, so the numeral
             chip and both text lines are one 2.75rem-tall target. -->
        <RouterLink
          :to="{ name: 'quran-surah', params: { surah: item.id } }"
          class="flex min-w-0 flex-1 items-center gap-3 after:absolute after:inset-0"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-sm tabular-nums text-muted-foreground"
          >
            {{ toArabicNumerals(item.id) }}
          </span>

          <span class="flex min-w-0 flex-col">
            <span class="truncate font-medium">{{ item.name }}</span>
            <span class="truncate text-xs text-muted-foreground">
              عدد الآيات: {{ toArabicNumerals(item.numberOfAyahs) }} - {{ item.isMeccan ? 'مكية' : 'مدنية' }}
            </span>
          </span>
        </RouterLink>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>
