<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { IconRadio } from '@tabler/icons-vue'
import { usePageMeta } from '@/shared/composables/usePageMeta'

import Page from '@/layout/Page.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'
import StatePanel from '@/shared/ui/StatePanel.vue'
import RadioPlayer from '@/features/radio/components/RadioPlayer.vue'
import radiosData from '@/features/radio/data/radios.js'
import { stationLabel } from '@/features/radio/lib/stationLabel'
import { getSimilarStations } from '@/features/radio/lib/similarStations'
import { useRadioStore } from '@/features/radio/store'
import { useFavorites } from '@/shared/composables/useFavorites'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const route = useRoute()
const online = useOnline()
const store = useRadioStore()
const { isFavorite, toggleFavorite } = useFavorites(STORAGE_KEYS.radioFavorites)

const stationSlug = computed(() => route.params.slug.toLowerCase())
const station = computed(() => radiosData[stationSlug.value])
const isCurrent = computed(() => !!station.value && store.station === station.value.url)
const isPlaying = computed(() => isCurrent.value && store.status === 'playing')
const isConnecting = computed(() => isCurrent.value && ['connecting', 'retrying'].includes(store.status))
const similar = computed(() => getSimilarStations(stationSlug.value, radiosData, 8))

usePageMeta(
  () =>
    station.value && {
      title: stationLabel(station.value),
      description: `استمع إلى ${stationLabel(station.value)} بث مباشر`,
      keywords: ['إذاعة', 'راديو', 'قرآن', station.value.name, 'بث مباشر'],
    },
)
</script>

<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>

  <Page v-else class="full-height" :class="{ 'd-flex align-items-center justify-content-center': !station }">
    <StatePanel
      v-if="!station"
      :icon="IconRadio"
      title="لم يتم العثور على الإذاعة"
      message="يمكنك العودة لقائمة الإذاعات المتاحة."
    >
      <RouterLink :to="{ name: 'radio' }" class="btn btn-soft embed-hidden">العودة إلى الإذاعات</RouterLink>
    </StatePanel>

    <RadioPlayer
      v-else
      :station="station"
      :is-playing="isPlaying"
      :is-connecting="isConnecting"
      :is-favorite="isFavorite(stationSlug)"
      :similar="similar"
      @toggle="isPlaying || isConnecting ? store.stop() : store.play(station.url, station)"
      @favorite="toggleFavorite(stationSlug)"
      @play-similar="(item) => store.play(item.url, item)"
    />
  </Page>
</template>
