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
  IconShare,
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

  <Page v-else class="radio-station-page">
    <!-- Not Found State -->
    <div v-if="!station" class="not-found-container">
      <div class="not-found-icon">📻</div>
      <Heading title="لم يتم العثور على الإذاعة" subtitle="يمكنك العودة لقائمة الإذاعات المتاحة." />
      <RouterLink class="back-btn" :to="{ name: 'radio' }">
        <IconArrowLeft size="1.25rem" />
        العودة إلى الإذاعات
      </RouterLink>
    </div>

    <!-- Main Player -->
    <div v-else class="player-wrapper">
      <!-- Ambient Background -->
      <div class="ambient-bg" :class="{ active: isPlaying }">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <!-- Navigation Header -->
      <div class="player-header">
        <RouterLink class="nav-btn" :to="{ name: 'radio' }">
          <IconArrowLeft size="1.25rem" />
          <span>العودة</span>
        </RouterLink>

        <button v-if="canShare" class="nav-btn" type="button" @click="shareStation">
          <IconShare size="1.25rem" />
          <span>مشاركة</span>
        </button>
      </div>

      <!-- Player Content -->
      <div class="player-content">
        <div class="player-grid">
          <div class="player-media">
            <!-- Vinyl/Disc Animation -->
            <div class="disc-container">
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
                <span v-for="i in 12" :key="i" class="wave" :style="{ '--i': i }"></span>
              </div>
            </div>
          </div>

          <div class="player-details">
            <!-- Station Info -->
            <div class="station-info">
              <h1 class="station-name">{{ station.name }}</h1>
              <p class="station-status">
                <span class="status-dot" :class="{ live: isPlaying }"></span>
                {{ isPlaying ? 'البث المباشر جارٍ الآن' : 'جاهز للتشغيل' }}
              </p>
            </div>

            <!-- Controls -->
            <div class="controls-container">
              <!-- Main Play Button -->
              <button
                class="play-btn"
                :class="{ playing: isPlaying }"
                type="button"
                @click="isPlaying ? store.stop() : store.play(station.url)"
              >
                <div class="play-btn-bg"></div>
                <div class="play-btn-icon">
                  <IconPlayerPause v-if="isPlaying" size="2.5rem" />
                  <IconPlayerPlay v-else size="2.5rem" />
                </div>
              </button>

              <!-- Favorite Button -->
              <button
                class="favorite-btn"
                :class="{ active: store.isFavorite(stationSlug) }"
                type="button"
                @click="store.toggleFavorite(stationSlug)"
              >
                <IconHeartFilled v-if="store.isFavorite(stationSlug)" size="1.5rem" />
                <IconHeart v-else size="1.5rem" />
                <span>{{ store.isFavorite(stationSlug) ? 'في المفضلة' : 'إضافة للمفضلة' }}</span>
              </button>
            </div>

            <!-- Footer Note -->
            <p class="footer-note">يتم تشغيل البث المباشر من مصدره الرسمي بجودة عالية</p>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.radio-station-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Not Found State
.not-found-container {
  text-align: center;
  padding: 3rem 1.5rem;

  .not-found-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    filter: grayscale(0.5);
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--bs-primary);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(var(--bs-primary-rgb), 0.35);
  }
}

// Player Wrapper
.player-wrapper {
  position: relative;
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  overflow: hidden;
}

// Ambient Background
.ambient-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.5;
  transition: opacity 0.8s ease;
  pointer-events: none;

  &.active {
    opacity: 1;
  }
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;

  &.orb-1 {
    width: 200px;
    height: 200px;
    background: var(--bs-primary);
    top: -50px;
    right: -50px;
    animation: float 8s ease-in-out infinite;
  }

  &.orb-2 {
    width: 150px;
    height: 150px;
    background: #d4a574;
    bottom: 20%;
    left: -30px;
    animation: float 10s ease-in-out infinite reverse;
  }

  &.orb-3 {
    width: 100px;
    height: 100px;
    background: #9c7b5c;
    bottom: -20px;
    right: 20%;
    animation: float 6s ease-in-out infinite 1s;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(15px, -15px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.95);
  }
}

// Navigation Header
.player-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(var(--bs-body-color-rgb), 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--bs-body-color-rgb), 0.1);
  border-radius: 50px;
  color: var(--bs-body-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--bs-body-color-rgb), 0.12);
    transform: translateY(-1px);
  }
}

// Player Content
.player-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.player-grid {
  display: grid;
  gap: 2.5rem;
  width: 100%;
  align-items: center;
  justify-items: center;
}

.player-media {
  position: relative;
}

.player-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

// Disc Container
.disc-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
}

.disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%, #2a2a2a 100%);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.1);
  position: relative;
  transition: transform 0.3s ease;

  &.spinning {
    animation: spin 4s linear infinite;
  }
}

.disc-inner {
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
}

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

.disc-grooves {
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
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Sound Waves
.sound-waves {
  position: absolute;
  inset: -30px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid var(--bs-primary);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);

  .sound-waves.active & {
    animation: ripple 3s ease-out infinite;
    animation-delay: calc(var(--i) * 0.25s);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

// Station Info
.station-info {
  margin-bottom: 2rem;
}

.station-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, var(--bs-body-color), var(--bs-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.station-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(var(--bs-body-color-rgb), 0.05);
  border-radius: 50px;
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bs-secondary);
  transition: all 0.3s ease;

  &.live {
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
    animation: pulse-dot 2s ease-in-out infinite;
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.1);
  }
}

// Controls
.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.play-btn {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: transparent;
  padding: 0;

  &:focus {
    outline: none;
  }
}

.play-btn-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--bs-primary), #5d4037);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 25px rgba(var(--bs-primary-rgb), 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  .play-btn:hover & {
    transform: scale(1.08);
    box-shadow:
      0 12px 35px rgba(var(--bs-primary-rgb), 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .play-btn:active & {
    transform: scale(0.95);
  }

  .play-btn.playing & {
    background: linear-gradient(145deg, #ef4444, #dc2626);
  }
}

.play-btn-icon {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    transition: transform 0.2s ease;
  }

  .play-btn:hover & svg {
    transform: scale(1.1);
  }
}

.favorite-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: rgba(var(--bs-body-color-rgb), 0.05);
  border: 2px solid rgba(var(--bs-body-color-rgb), 0.1);
  border-radius: 50px;
  color: var(--bs-body-color);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.3);
    color: #ef4444;
  }

  &.active {
    background: rgba(220, 38, 38, 0.1);
    border-color: #ef4444;
    color: #ef4444;

    svg {
      animation: heartbeat 0.6s ease-in-out;
    }
  }
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(0.95);
  }
  75% {
    transform: scale(1.1);
  }
}

// Footer Note
.footer-note {
  font-size: 0.8125rem;
  color: var(--bs-secondary-color);
  opacity: 0.8;
  max-width: 280px;
}

// Responsive
@media (min-width: 768px) {
  .player-wrapper {
    padding: 3rem 2.5rem;
  }

  .disc-container {
    width: 240px;
    height: 240px;
  }

  .station-name {
    font-size: 2rem;
  }

  .play-btn {
    width: 90px;
    height: 90px;
  }
}

@media (min-width: 992px) {
  .player-grid {
    grid-template-columns: minmax(240px, 1fr) minmax(0, 1fr);
    justify-items: stretch;
  }

  .player-details {
    align-items: flex-start;
    text-align: start;
  }

  .controls-container {
    align-items: flex-start;
  }

  .footer-note {
    max-width: none;
  }
}
</style>
