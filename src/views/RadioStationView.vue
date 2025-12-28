<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useOnline } from '@vueuse/core'
import { useMeta } from '@/utilities/head'
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconPlayerPause,
  IconPlayerPlay,
  IconShare3,
  IconRadio,
} from '@tabler/icons-vue'

import Page from '@/components/Layout/Page.vue'
import Heading from '@/components/Heading.vue'
import OfflineState from '@/components/OfflineState.vue'
import radiosData from '@/exports/Radios.js'
import { useRadioStore } from '@/stores/radio'

const route = useRoute()
const online = useOnline()
const store = useRadioStore()

const stationSlug = computed(() => route.params.slug.toLowerCase())
const station = computed(() => radiosData[stationSlug.value])
const isPlaying = computed(() => station.value && store.station === station.value.url)
const canShare = computed(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function')

watchEffect(() => {
  if (station.value) {
    useMeta({
      title: station.value.name,
      description: `استمع إلى ${station.value.name} بث مباشر`,
      keywords: ['إذاعة', 'راديو', 'قرآن', station.value.name, 'بث مباشر'],
    })
  }
})

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

  <Page v-else class="radio-station-page d-flex align-items-center justify-content-center">
    <!-- Not Found State -->
    <div v-if="!station" class="text-center py-5 px-3">
      <div class="display-1 mb-4 opacity-50">📻</div>
      <Heading title="لم يتم العثور على الإذاعة" subtitle="يمكنك العودة لقائمة الإذاعات المتاحة." />
      <RouterLink class="btn btn-primary" :to="{ name: 'radio' }">
        <IconArrowLeft size="1.25rem" />
        العودة إلى الإذاعات
      </RouterLink>
    </div>

    <!-- Main Player -->
    <div v-else class="position-relative w-100 mx-auto" style="max-width: 500px">
      <!-- Navigation Header -->
      <div class="d-flex justify-content-between mb-4 position-relative z-1">
        <RouterLink class="btn btn-flat" :to="{ name: 'radio' }">
          <IconArrowLeft size="1.25rem" class="me-2"/>
          <span>العودة</span>
        </RouterLink>

        <button v-if="canShare" class="btn btn-flat" type="button" @click="shareStation">
          <IconShare3 size="1.25rem" class="me-2"/>
          <span>مشاركة</span>
        </button>
      </div>

      <!-- Player Content -->
      <div class="d-flex flex-column align-items-center text-center position-relative z-1">
        <!-- Vinyl/Disc Animation -->
        <div class="disc-container mb-5 position-relative d-flex align-items-center justify-content-center">
          <div class="disc" :class="{ spinning: isPlaying }">
            <div class="disc-inner">
              <div class="disc-label">
                <IconRadio size="2rem" />
              </div>
            </div>
            <div class="disc-grooves"></div>
          </div>

          <!-- Sound Waves -->
          <div class="sound-waves" :class="{ active: isPlaying }">
            <span v-for="i in 3" :key="i" class="wave" :style="{ '--i': i }"></span>
          </div>
        </div>

        <!-- Station Info -->
        <div class="mb-5">
          <h1 class="h2 fw-bold mb-2">{{ station.name }}</h1>
          <p class="d-inline-flex align-items-center gap-2 small text-secondary m-0">
            <span class="status-dot" :class="{ live: isPlaying }"></span>
            {{ isPlaying ? 'البث المباشر جارٍ الآن' : 'جاهز للتشغيل' }}
          </p>
        </div>

        <!-- Controls -->
        <div class="d-flex flex-column align-items-center gap-4 mb-4 w-100">
          <!-- Main Play Button -->
          <button
            class="play-btn"
            :class="isPlaying ? 'bg-danger' : 'bg-primary'"
            type="button"
            @click="isPlaying ? store.stop() : store.play(station.url)"
          >
            <IconPlayerPause v-if="isPlaying" size="2.5rem" />
            <IconPlayerPlay v-else size="2.5rem" />
          </button>

          <!-- Favorite Button -->
          <button
            class="btn btn-flat"
            :class="store.isFavorite(stationSlug) ? 'text-danger' : 'text-body'"
            type="button"
            @click="store.toggleFavorite(stationSlug)"
          >
            <IconHeartFilled v-if="store.isFavorite(stationSlug)" size="1.5rem" class="me-2"/>
            <IconHeart v-else size="1.5rem" class="me-2"/>
            <span>{{ store.isFavorite(stationSlug) ? 'في المفضلة' : 'إضافة للمفضلة' }}</span>
          </button>
        </div>

        <!-- Footer Note -->
        <p class="small text-secondary opacity-75">
          يتم تشغيل البث المباشر من مصدره الرسمي بجودة عالية
        </p>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.radio-station-page {
  margin-block: 0;
  min-height: calc(100vh - var(--navbar-height));
}

.disc-container {
  width: 240px;
  height: 240px;

  .disc {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%, #2a2a2a 100%);
    box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.4),
      inset 0 2px 10px rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 2;
    transition: transform 0.3s ease;

    &.spinning {
      animation: spin 8s linear infinite;
    }

    &-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(145deg, var(--bs-primary), #5d4037);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        inset 0 2px 8px rgba(0, 0, 0, 0.3),
        0 4px 12px rgba(0, 0, 0, 0.2);

      .disc-label {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &-grooves {
      position: absolute;
      inset: 25px;
      border-radius: 50%;
      background: repeating-radial-gradient(
        circle at center,
        transparent 0px,
        transparent 2px,
        rgba(255, 255, 255, 0.03) 3px,
        transparent 4px
      );
      pointer-events: none;
    }
  }

  .sound-waves {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;

    .wave {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 1px solid var(--bs-primary);
      border-radius: 50%;
      opacity: 0;
      transform: scale(0.8);
    }

    &.active .wave {
      animation: ripple 2s ease-out infinite;
      animation-delay: calc(var(--i) * 0.4s);
    }
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bs-secondary);
  transition: all 0.3s ease;

  &.live {
    background: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  }
}

.play-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 768px) {
    width: 90px;
    height: 90px;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }

  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
</style>
