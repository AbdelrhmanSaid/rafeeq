<script setup>
import { useRadioStore } from '@/features/radio/store'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-vue'
import { computed } from 'vue'
import { useOnline } from '@vueuse/core'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import SearchableFavoritesList from '@/shared/ui/SearchableFavoritesList.vue'
import { Button } from '@/shared/components/ui/button'
import radiosData from '@/features/radio/data/radios.js'
import OfflineState from '@/shared/ui/OfflineState.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const store = useRadioStore()
const online = useOnline()

const radiosList = computed(() =>
  Object.entries(radiosData).map(([slug, station]) => ({
    slug,
    ...station,
  })),
)
</script>
<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>
  <Page v-else>
    <Heading title="الإذاعة" subtitle="استمع لإذاعات القرآن الكريم المختلفة حول العالم" :share="true" />
    <SearchableFavoritesList
      :items="radiosList"
      item-key="slug"
      :favorites-key="STORAGE_KEYS.radioFavorites"
      search-type="search"
      placeholder="تبحث عن إذاعة معينة؟"
      :item-class="(item) => ({ active: store.station === item.url })"
    >
      <template #favorites-title>
        <h2 class="mb-3 px-1 text-lg">الإذاعات المفضلة</h2>
      </template>
      <template #all-title>
        <h2 class="mb-3 px-1 text-lg">كل الإذاعات</h2>
      </template>
      <template #default="{ item, index }">
        <RouterLink
          :to="{ name: 'radio-station', params: { slug: item.slug } }"
          class="min-w-0 flex-1 truncate text-start after:absolute after:inset-0"
        >
          <span class="me-2 text-sm tabular-nums text-muted-foreground">{{ toArabicNumerals(index + 1) }}.</span>
          <span>{{ item.name }}</span>
        </RouterLink>
      </template>
      <template #actions="{ item }">
        <Button
          variant="ghost"
          size="icon"
          class="relative z-1 size-11 shrink-0 rounded-full text-primary active:scale-90"
          title="إيقاف"
          @click.stop="store.stop()"
          v-if="store.station === item.url"
        >
          <IconPlayerPause class="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="relative z-1 size-11 shrink-0 rounded-full text-muted-foreground active:scale-90"
          title="تشغيل"
          @click.stop="store.play(item.url)"
          v-else
        >
          <IconPlayerPlay class="size-5" />
        </Button>
      </template>
    </SearchableFavoritesList>
  </Page>
</template>
