import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, reactive, nextTick } from 'vue'
import { useMushafFollow } from './useMushafFollow'

const storeMock = reactive({ currentSurahNumber: 2, currentAyah: null })

vi.mock('@/features/quran/store', () => ({
  useQuranStore: () => storeMock,
}))

// Ayahs 1-4 on page 2, ayah 5 on page 3.
const pageOfAyah = (ayah) => (ayah <= 4 ? 2 : 3)

function setup() {
  const visiblePage = ref(2)
  const isAutoNavigating = ref(false)
  const goToPage = vi.fn()
  const follow = useMushafFollow({
    surahNumber: () => 2,
    visiblePage,
    isAutoNavigating,
    goToPage,
    pageOfAyah,
  })
  return { visiblePage, isAutoNavigating, goToPage, ...follow }
}

describe('useMushafFollow', () => {
  beforeEach(() => {
    storeMock.currentSurahNumber = 2
    storeMock.currentAyah = null
  })

  it('turns to the reciting ayah page when it changes', async () => {
    const { goToPage } = setup()

    storeMock.currentAyah = { ayah: 5 }
    await nextTick()

    expect(goToPage).toHaveBeenCalledWith(3, { behavior: 'smooth', ayah: 5 })
  })

  it('does not navigate when the ayah is already on the visible page', async () => {
    const { goToPage } = setup()

    storeMock.currentAyah = { ayah: 3 }
    await nextTick()

    expect(goToPage).not.toHaveBeenCalled()
  })

  it('ignores playback of a different surah', async () => {
    const { goToPage } = setup()

    storeMock.currentSurahNumber = 3
    storeMock.currentAyah = { ayah: 5 }
    await nextTick()

    expect(goToPage).not.toHaveBeenCalled()
  })

  it('suspends after a manual page change away from the reciter', async () => {
    const { visiblePage, goToPage, suspended } = setup()

    storeMock.currentAyah = { ayah: 3 }
    await nextTick()

    visiblePage.value = 3
    await nextTick()
    expect(suspended.value).toBe(true)

    // While suspended, new ayahs no longer turn pages.
    storeMock.currentAyah = { ayah: 4 }
    await nextTick()
    expect(goToPage).not.toHaveBeenCalled()
  })

  it('does not suspend on auto-navigation', async () => {
    const { visiblePage, isAutoNavigating, suspended } = setup()

    storeMock.currentAyah = { ayah: 3 }
    await nextTick()

    isAutoNavigating.value = true
    visiblePage.value = 3
    await nextTick()

    expect(suspended.value).toBe(false)
  })

  it('resumes to the reciting page and clears suspension', async () => {
    const { visiblePage, goToPage, suspended, resume } = setup()

    storeMock.currentAyah = { ayah: 3 }
    await nextTick()
    visiblePage.value = 3
    await nextTick()
    expect(suspended.value).toBe(true)

    resume()
    expect(suspended.value).toBe(false)
    expect(goToPage).toHaveBeenCalledWith(2, { behavior: 'smooth', ayah: 3 })
  })

  it('clears suspension when playback stops', async () => {
    const { visiblePage, suspended } = setup()

    storeMock.currentAyah = { ayah: 3 }
    await nextTick()
    visiblePage.value = 3
    await nextTick()
    expect(suspended.value).toBe(true)

    storeMock.currentAyah = null
    await nextTick()
    expect(suspended.value).toBe(false)
  })

  it('returning to the reciting page manually clears suspension', async () => {
    const { visiblePage, suspended } = setup()

    storeMock.currentAyah = { ayah: 3 }
    await nextTick()
    visiblePage.value = 3
    await nextTick()
    expect(suspended.value).toBe(true)

    visiblePage.value = 2
    await nextTick()
    expect(suspended.value).toBe(false)
  })
})
