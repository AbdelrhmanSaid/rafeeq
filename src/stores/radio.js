import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import radios from '@/exports/Radios.js'
import { useLocalStorage } from '@vueuse/core'
import { toast } from 'vue-sonner'

export const useRadioStore = defineStore('radio', () => {
  const player = new Audio()

  const station = ref(null)
  const isPlaying = computed(() => station.value !== null)

  const favoriteKeys = useLocalStorage('radioFavorites', [])
  const favorites = computed(() =>
    Object.entries(radios)
      .filter(([slug]) => favoriteKeys.value.includes(slug))
      .map(([slug, station]) => ({ slug, ...station })),
  )

  const getSlugForUrl = (url) => Object.entries(radios).find(([, station]) => station.url === url)?.[0]

  if (favoriteKeys.value.some((favorite) => !radios[favorite])) {
    favoriteKeys.value = Array.from(
      new Set(
        favoriteKeys.value.map((favorite) => (radios[favorite] ? favorite : getSlugForUrl(favorite))).filter(Boolean),
      ),
    )
  }

  let retries = 0
  let retryTimeout = null

  const retry = () => {
    if (!station.value || retries >= 3) {
      toast.error('تعذر تشغيل الإذاعة، حاول مرة أخرى لاحقاً.')
      stop()
      return
    }
    retries++
    toast.info(`تعذر تشغيل الإذاعة، جارٍ إعادة الاتصال... (${retries}/3)`)
    retryTimeout = setTimeout(() => {
      player.src = station.value
      player.play().catch(() => {})
    }, 3000)
  }

  player.addEventListener('error', () => station.value && !retryTimeout && retry())
  player.addEventListener('playing', () => {
    if (retries > 0) toast.success('تم استعادة الاتصال بالإذاعة')
    retries = 0
  })

  function play(url) {
    clearTimeout(retryTimeout)
    retryTimeout = null
    retries = 0
    player.src = url
    station.value = url
    player.play().catch(() => {})
  }

  function stop() {
    clearTimeout(retryTimeout)
    retryTimeout = null
    retries = 0
    player.pause()
    player.src = ''
    station.value = null
  }

  function isFavorite(stationSlug) {
    return favoriteKeys.value.includes(stationSlug)
  }

  function toggleFavorite(stationSlug) {
    if (isFavorite(stationSlug)) {
      favoriteKeys.value = favoriteKeys.value.filter((slug) => slug !== stationSlug)
    } else {
      favoriteKeys.value.push(stationSlug)
    }
  }

  return {
    station,
    isPlaying,
    favorites,
    play,
    stop,
    isFavorite,
    toggleFavorite,
  }
})
