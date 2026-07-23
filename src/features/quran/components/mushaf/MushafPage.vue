<script setup>
import { computed } from 'vue'
import { toArabicNumerals, normalizeQuranicText } from '@/shared/utils/arabic'
import { SURAH_NAMES_FONT_FAMILY } from '@/features/quran/fonts/qcfFontCache'

const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ'

const props = defineProps({
  page: { type: Object, required: true },
  surahId: { type: Number, required: true },
  surahName: { type: String, required: true },
  fontReady: { type: Boolean, default: false },
  fontFailed: { type: Boolean, default: false },
  surahNamesReady: { type: Boolean, default: false },
  currentAyah: { type: Number, default: null },
  bookmarkedAyah: { type: Number, default: null },
})

const emit = defineEmits(['select'])

// The sura_names font maps surah N to the PUA codepoint whose hex digits
// spell N in decimal (surah 114 → U+E114).
const surahNameGlyph = computed(() => String.fromCodePoint(parseInt(`e${String(props.surahId).padStart(3, '0')}`, 16)))

const surahNamesFontFamily = SURAH_NAMES_FONT_FAMILY

function onTap(event) {
  const word = event.target.closest('[data-ayah]')
  if (word) emit('select', Number(word.dataset.ayah))
}
</script>

<template>
  <article class="mushaf-page" :class="{ ornamental: page.lineCount === 8 }">
    <!-- Same-geometry skeleton so nothing shifts when the font arrives. -->
    <div v-if="!fontReady && !fontFailed" class="mushaf-lines mushaf-skeleton" aria-hidden="true">
      <div v-for="n in page.lineCount" :key="n" class="skeleton-line" :style="{ gridRow: n }" />
    </div>

    <!-- The page font can't load (e.g. offline, never downloaded): readable fallback. -->
    <div v-else-if="fontFailed" class="mushaf-fallback font-quran" @click="onTap">
      <span
        v-for="ayah in page.ayahs"
        :key="ayah.numberInSurah"
        class="fallback-ayah"
        :data-ayah="ayah.numberInSurah"
        :class="{
          'is-current': ayah.numberInSurah === currentAyah,
          'is-bookmarked': ayah.numberInSurah === bookmarkedAyah,
        }"
        >{{ ayah.text }} ﴿{{ toArabicNumerals(ayah.numberInSurah) }}﴾
      </span>
    </div>

    <div
      v-else
      class="mushaf-lines"
      :style="{ fontFamily: page.fontFamily, gridTemplateRows: `repeat(${page.lineCount}, 1fr)` }"
      @click="onTap"
    >
      <div
        v-for="line in page.lines"
        :key="line.line"
        class="mushaf-line"
        :class="{ centered: line.centered }"
        :style="{ gridRow: line.line }"
      >
        <span
          v-if="line.type === 'surah_name'"
          class="surah-name"
          :style="surahNamesReady ? { fontFamily: surahNamesFontFamily } : null"
        >
          <template v-if="surahNamesReady">{{ surahNameGlyph }}</template>
          <span v-else class="surah-name-text font-quran">{{ normalizeQuranicText(surahName) }}</span>
        </span>

        <span v-else-if="line.type === 'basmala'" class="basmala font-quran">{{ BASMALA }}</span>

        <template v-else>
          <span
            v-for="(word, index) in line.words"
            :key="index"
            class="word"
            :data-ayah="word.ayah"
            :class="{
              'is-current': word.ayah === currentAyah,
              'is-bookmarked': word.ayah === bookmarkedAyah,
            }"
            >{{ word.glyph }}</span
          >
        </template>
      </div>
    </div>

    <footer class="mushaf-page-number" aria-hidden="true">{{ toArabicNumerals(page.page) }}</footer>
  </article>
</template>

<style lang="scss" scoped>
.mushaf-page {
  container-type: inline-size;
  inline-size: 100%;
  max-inline-size: var(--mushaf-page-max-inline-size, 700px);
  margin-inline: auto;
  // King Fahd Madani page proportion, plus a strip for the page number.
  aspect-ratio: 61 / 103;
  display: flex;
  flex-direction: column;
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius-lg);
  // Page geometry is deliberately px/cqw-only — the mushaf is a facsimile and
  // must not reflow with the app's root font scale.
  padding: 4cqw 4.5cqw 2cqw;
  user-select: none;
}

.mushaf-lines {
  flex: 1;
  min-block-size: 0;
  display: grid;
  grid-template-rows: repeat(15, 1fr);
  // Quran text is always RTL — the rtlcss build pass must not flip this
  // (it would reverse the word order of every line).
  /* rtl:ignore */
  direction: rtl;
}

.mushaf-line {
  display: flex;
  align-items: center;
  min-inline-size: 0;
  font-size: 5.5cqw;
  line-height: 1;

  &.centered {
    justify-content: center;
    gap: 0.35em;
  }

  // Growing the word boxes (text centered inside each) justifies every line to
  // the full measure and keeps per-ayah highlights contiguous across words.
  &:not(.centered) .word {
    flex: 1 0 auto;
    text-align: center;
  }
}

.word {
  cursor: pointer;
  white-space: nowrap;

  &.is-current {
    background-color: var(--bs-secondary-bg);
  }

  &.is-bookmarked {
    background-color: rgba(var(--bs-primary-rgb), 0.12);
    box-shadow:
      inset 0 1px 0 rgba(var(--bs-primary-rgb), 0.35),
      inset 0 -1px 0 rgba(var(--bs-primary-rgb), 0.35);
  }
}

.surah-name {
  font-size: 7.5cqw;
  line-height: 1;

  .surah-name-text {
    font-size: 5.5cqw;
    padding: 0.2em 1.2em;
    border-block: 2px solid rgba(var(--bs-primary-rgb), 0.45);
  }
}

.basmala {
  font-size: 4.8cqw;
}

.ornamental {
  .mushaf-lines {
    padding: 12cqw 8cqw;
  }

  .mushaf-line {
    // Sized so the densest ornamental line still fits its centered box.
    font-size: 5.8cqw;
    justify-content: center;

    .word {
      flex: 0 0 auto;
      margin-inline: 0.12em;
    }
  }
}

.mushaf-skeleton {
  .skeleton-line {
    align-self: center;
    block-size: 5.5cqw;
    inline-size: 100%;
    border-radius: var(--bs-border-radius-sm);
    background-color: var(--bs-secondary-bg);
    animation: mushaf-skeleton-pulse 1.5s ease-in-out infinite;
  }
}

@keyframes mushaf-skeleton-pulse {
  50% {
    opacity: 0.4;
  }
}

.mushaf-fallback {
  flex: 1;
  min-block-size: 0;
  overflow-y: auto;
  /* rtl:ignore */
  direction: rtl;
  text-align: justify;
  font-size: 5cqw;
  line-height: 2;

  .fallback-ayah {
    cursor: pointer;

    &.is-current {
      background-color: var(--bs-secondary-bg);
    }

    &.is-bookmarked {
      background-color: rgba(var(--bs-primary-rgb), 0.12);
      box-shadow: inset 0 0 0 1px rgba(var(--bs-primary-rgb), 0.35);
      border-radius: var(--bs-border-radius-sm);
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }
  }
}

.mushaf-page-number {
  flex: 0 0 auto;
  text-align: center;
  padding-block-start: 1.5cqw;
  font-size: 2.6cqw;
  color: var(--bs-secondary-color);
  font-family: 'Thmanyah Sans', sans-serif;
}
</style>
