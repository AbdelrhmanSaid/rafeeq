const API_BASE_URL = 'http://api.alquran.cloud/v1'

export class QuranService {
  static async getAudioForVerse(verseNumber, reciterIdentifier = 'ar.alafasy') {
    try {
      const response = await fetch(`${API_BASE_URL}/ayah/${verseNumber}/${reciterIdentifier}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.status || 'API Error')
      }

      return data.data
    } catch (error) {
      console.error('Error fetching verse audio:', error)
      throw error
    }
  }

  static async getAudioForSurah(surahNumber, reciterIdentifier = 'ar.alafasy') {
    try {
      const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.status || 'API Error')
      }

      return data.data
    } catch (error) {
      console.error('Error fetching surah audio:', error)
      throw error
    }
  }

  static async getAvailableReciters(language = 'ar') {
    try {
      const response = await fetch(`${API_BASE_URL}/edition?format=audio&language=${language}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.status || 'API Error')
      }

      // Filter only verse-by-verse reciters
      return data.data.filter((reciter) => reciter.type === 'versebyverse')
    } catch (error) {
      console.error('Error fetching reciters:', error)
      throw error
    }
  }

  static async getAudioForJuz(juzNumber, reciterIdentifier = 'ar.alafasy') {
    try {
      const response = await fetch(`${API_BASE_URL}/juz/${juzNumber}/${reciterIdentifier}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(data.status || 'API Error')
      }

      return data.data
    } catch (error) {
      console.error('Error fetching juz audio:', error)
      throw error
    }
  }

  static getAudioQuality(audioUrl, quality = '128') {
    if (!audioUrl) return null

    // Default is 128kbps, but we can switch to 64kbps for slower connections
    if (quality === '64') {
      return audioUrl.replace('/128/', '/64/')
    }

    return audioUrl
  }

  static preloadAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      const audio = new Audio()

      audio.addEventListener('canplaythrough', () => {
        resolve(audio)
      })

      audio.addEventListener('error', (error) => {
        reject(error)
      })

      audio.preload = 'auto'
      audio.src = audioUrl
    })
  }

  static async downloadAudio(audioUrl, filename) {
    try {
      const response = await fetch(audioUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'quran_audio.mp3'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading audio:', error)
      throw error
    }
  }

  static buildAudioPlaylist(ayahs, surahInfo, reciterInfo) {
    return ayahs.map((ayah, index) => ({
      id: `${surahInfo.number}-${ayah.numberInSurah}`,
      index,
      verseNumber: ayah.numberInSurah,
      globalVerseNumber: ayah.number,
      audioUrl: ayah.audio,
      audioSecondary: ayah.audioSecondary,
      text: ayah.text,
      surahNumber: surahInfo.number,
      surahName: surahInfo.name,
      surahEnglishName: surahInfo.englishName,
      reciterName: reciterInfo.name,
      reciterEnglishName: reciterInfo.englishName,
      reciterIdentifier: reciterInfo.identifier,
    }))
  }

  static formatAudioDuration(seconds) {
    if (!seconds || seconds === 0) return '0:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  static validateAudioUrl(url) {
    if (!url) return false

    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }
}

export default QuranService
