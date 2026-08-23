<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { IconRadio } from '@tabler/icons-vue'
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

  <Page v-else class="flex min-h-[60svh] items-center justify-center">
    <!-- Not Found State -->
    <div v-if="!station" class="mx-auto flex max-w-sm flex-col items-center py-8 text-center">
      <span class="mb-5 grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <IconRadio class="size-6" />
      </span>

      <Heading :size="2" title="لم يتم العثور على الإذاعة" subtitle="يمكنك العودة لقائمة الإذاعات المتاحة." />

      <BackButton
        :to="{ name: 'radio' }"
        label="العودة إلى الإذاعات"
        button-class="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
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
