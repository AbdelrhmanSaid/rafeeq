import { computed, ref, shallowRef, toValue, watch } from 'vue'
import { buildIndex, excerpt, isSearchable, parseQuery, searchAyat } from '@/features/quran/lib/ayahSearch'
import { pageOfAyah, surahName, verseAt, verseKey } from '@/features/quran/lib/mushaf'
import { QURAN_TEXT_PATH } from '@/features/quran/lib/quranText'
import { toArabicNumerals } from '@/shared/utils/arabic'

const PAGE_SIZE = 50

// Shared, so coming back to the list finds the index built and draws its results at once.
const index = shallowRef(null)
let loading = null

function loadIndex() {
  loading ??= (async () => {
    const response = await fetch(`/${QURAN_TEXT_PATH}`)
    if (!response.ok) throw new Error(`Failed to fetch the Quran's text: ${response.status}`)
    index.value = await buildIndex(await response.json())
  })().catch((error) => {
    loading = null
    throw error
  })
  return loading
}

// `shown` is how many results are listed; a caller keeps it to bring a list back as it was left.
export function useAyahSearch(search, shown = ref(PAGE_SIZE)) {
  const failed = ref(false)
  const query = computed(() => parseQuery(toValue(search)))
  const isActive = computed(() => isSearchable(query.value))

  shown.value ||= PAGE_SIZE
  watch(query, () => (shown.value = PAGE_SIZE))

  watch(
    query,
    () => {
      if (!isActive.value || index.value) return
      // Every keystroke asks again, so a failed load is retried without a button.
      failed.value = false
      loadIndex().catch(() => (failed.value = true))
    },
    { immediate: true },
  )

  const found = computed(() => (isActive.value && index.value ? searchAyat(index.value, query.value) : null))

  const row = (position, isClose) => {
    const { surah, ayah } = verseAt(position + 1)
    return {
      key: verseKey(surah, ayah),
      title: `${surahName(surah)} ${toArabicNumerals(ayah)}`,
      page: pageOfAyah(surah, ayah),
      ...excerpt(index.value, position, query.value, isClose),
    }
  }

  const exactCount = computed(() => found.value?.exact.length ?? 0)
  const closeCount = computed(() => found.value?.close.length ?? 0)
  const exact = computed(() => (found.value?.exact ?? []).slice(0, shown.value).map((position) => row(position, false)))
  const close = computed(() =>
    (found.value?.close ?? [])
      .slice(0, Math.max(0, shown.value - exactCount.value))
      .map((position) => row(position, true)),
  )

  return {
    isLoading: computed(() => isActive.value && !index.value && !failed.value),
    failed: computed(() => isActive.value && failed.value),
    exact,
    close,
    exactCount,
    closeCount,
    total: computed(() => exactCount.value + closeCount.value),
    hasMore: computed(() => exactCount.value + closeCount.value > shown.value),
    showMore: () => (shown.value += PAGE_SIZE),
  }
}

// Tests start from an app that hasn't searched yet.
export function resetAyahSearchForTests() {
  index.value = null
  loading = null
}
