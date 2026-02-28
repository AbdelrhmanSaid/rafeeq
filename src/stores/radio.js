import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { toArabicNumerals } from '@/utilities/arabic'

export const useRadioStore = defineStore('radio', () => {
  const player = new Audio()

  const station = ref(null)
  const isPlaying = computed(() => station.value !== null)

  let retries = 0
  let retryTimeout = null

  const retry = () => {
    if (!station.value || retries >= 3) {
      toast.error('تعذر تشغيل الإذاعة، حاول مرة أخرى لاحقاً.')
      stop()
      return
    }
    retries++
    toast.info(`تعذر تشغيل الإذاعة، جارٍ إعادة الاتصال... (${toArabicNumerals(retries)}/٣)`)
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

  return {
    station,
    isPlaying,
    play,
    stop,
  }
})
