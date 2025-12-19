<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { IconArrowLeft, IconHeart, IconHeartFilled, IconPlayerPause, IconPlayerPlay, IconShare } from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import OfflineState from '@/components/OfflineState.vue'
import radiosData from '@/exports/Radios.js'
import { useRadioStore } from '@/stores/radio'

const route = useRoute()
const online = useOnline()
const store = useRadioStore()

const station = computed(() => radiosData[route.params.slug])
const isPlaying = computed(() => station.value && store.station === station.value.url)
const canShare = computed(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function')

const shareStation = async () => {
  if (!station.value || !navigator.share) {
    return
  }

  try {
    await navigator.share({
      title: station.value.name,
      text: `استمع إلى ${station.value.name}`,
      url: window.location.href,
    })
  } catch (error) {
    // User canceled or share failed
  }
}
</script>

<template>
  <Page v-if="!online">
    <OfflineState />
  </Page>

  <Page v-else>
    <div v-if="!station" class="text-center py-5">
      <Heading title="لم يتم العثور على الإذاعة" subtitle="يمكنك العودة لقائمة الإذاعات المتاحة." />
      <RouterLink class="btn btn-outline-primary mt-3" :to="{ name: 'radio' }">
        العودة إلى الإذاعات
      </RouterLink>
    </div>

    <div v-else class="radio-player card border-0 shadow-sm p-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <RouterLink class="btn btn-outline-secondary" :to="{ name: 'radio' }">
          <IconArrowLeft size="1.25rem" class="me-2" />
          العودة
        </RouterLink>

        <button
          v-if="canShare"
          class="btn btn-outline-primary"
          type="button"
          @click="shareStation"
        >
          <IconShare size="1.25rem" class="me-2" />
          مشاركة
        </button>
      </div>

      <Heading :title="station.name" subtitle="استمع الآن إلى بث مباشر بجودة عالية." />

      <div class="d-flex flex-column align-items-center justify-content-center py-4">
        <div class="player-visual mb-4" :class="{ playing: isPlaying }">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>

        <div class="d-flex flex-wrap gap-3 justify-content-center">
          <button
            class="btn btn-primary btn-lg px-4"
            type="button"
            @click="isPlaying ? store.stop() : store.play(station.url)"
          >
            <IconPlayerPause v-if="isPlaying" size="1.5rem" class="me-2" />
            <IconPlayerPlay v-else size="1.5rem" class="me-2" />
            {{ isPlaying ? 'إيقاف البث' : 'تشغيل البث' }}
          </button>

          <button
            class="btn btn-outline-danger btn-lg px-4"
            type="button"
            @click="store.toggleFavorite(station.url)"
          >
            <IconHeartFilled v-if="store.isFavorite(station.url)" size="1.5rem" class="me-2" />
            <IconHeart v-else size="1.5rem" class="me-2" />
            {{ store.isFavorite(station.url) ? 'إزالة من المفضلة' : 'إضافة للمفضلة' }}
          </button>
        </div>
      </div>

      <div class="text-center text-muted small">
        يتم تشغيل البث المباشر من مصدره الرسمي.
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.radio-player {
  border-radius: 1.25rem;
}

.player-visual {
  display: grid;
  grid-template-columns: repeat(3, 12px);
  gap: 8px;
  height: 40px;
  align-items: end;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  .bar {
    display: block;
    width: 100%;
    height: 14px;
    border-radius: 999px;
    background: var(--bs-primary);
  }

  &.playing {
    opacity: 1;

    .bar {
      animation: pulse 0.8s ease-in-out infinite;
    }

    .bar:nth-child(2) {
      animation-delay: 0.15s;
    }

    .bar:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    height: 14px;
  }

  50% {
    height: 32px;
  }
}
</style>
