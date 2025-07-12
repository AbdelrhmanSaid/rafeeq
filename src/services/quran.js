const API_BASE_URL = 'http://api.alquran.cloud/v1'

export default class QuranService {
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
}
