<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { usePageMeta } from '@/shared/composables/usePageMeta'

import Page from '@/layout/Page.vue'
import Heading from '@/shared/ui/Heading.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import OfflineState from '@/shared/ui/OfflineState.vue'
import RadioPlayer from '@/features/radio/components/RadioPlayer.vue'
import radiosData from '@/features/radio/data/radios.js'
import { useRadioStore } from '@/features/radio/store'
import { useFavorites } from '@/shared/composables/useFavorites'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'

const route = useRoute()
const online = useOnline()
const store = useRadioStore()
const { isFavorite, toggleFavorite } = useFavorites(STORAGE_KEYS.radioFavorites)

const stationSlug = computed(() => route.params.slug.toLowerCase())
const station = computed(() => radiosData[stationSlug.value])
const isPlaying = computed(() => station.value && store.station === station.value.url)
const canShare = computed(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function')

usePageMeta(
  () =>
    station.value && {
      title: station.value.name,
      description: `استمع إلى ${station.value.name} بث مباشر`,
      keywords: ['إذاعة', 'راديو', 'قرآن', station.value.name, 'بث مباشر'],
    },
)

const shareStation = async () => {
  if (!station.value || !navigator.share) {
    return
  }

  const data = {
    title: station.value.name,
    text: `استمع إلى ${station.value.name}`,
    url: window.location.href,
  }

  try {
    await navigator.share(data)
  } catch {
    // User canceled or share failed
  }
}
</script>

<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>

  <Page v-else class="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center">
    <!-- Not Found State -->
    <div v-if="!station" class="px-4 py-12 text-center">
      <div class="mb-6 text-7xl opacity-50">📻</div>
      <Heading title="لم يتم العثور على الإذاعة" subtitle="يمكنك العودة لقائمة الإذاعات المتاحة." />
      <BackButton
        :to="{ name: 'radio' }"
        label="العودة إلى الإذاعات"
        button-class="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
      />
    </div>

    <!-- Main Player -->
    <RadioPlayer
      v-else
      :station="station"
      :is-playing="isPlaying"
      :is-favorite="isFavorite(stationSlug)"
      :can-share="canShare"
      @toggle="isPlaying ? store.stop() : store.play(station.url)"
      @favorite="toggleFavorite(stationSlug)"
      @share="shareStation"
    />
  </Page>
</template>
