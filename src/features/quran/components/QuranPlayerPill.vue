<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import {
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconLoader2,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-vue'
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore } from '@/features/quran/store'
import { isHafsRecording, recordingStyle } from '@/features/quran/lib/reciters'
import { rovingTarget } from '@/features/quran/lib/rovingFocus'
import { useSearch } from '@/shared/composables/useSearch'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

defineProps({
  playing: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const quranStore = useQuranStore()

// The Mushaf is in Hafs, so the list offers the reciters who recorded the whole Quran in it, plus whoever was picked
// in Settings, which may be another riwaya: it plays, but the ayah isn't followed.
const choices = computed(() =>
  reciters.filter((r) => (r.soar_count >= 114 && isHafsRecording(r)) || r.id === Number(quranStore.currentReciter)),
)

const showReciters = ref(false)
const { search, filtered } = useSearch(choices, ['name'])
const list = useTemplateRef('list')

async function openReciters() {
  search.value = ''
  showReciters.value = true
  await nextTick()
  list.value?.querySelector('[aria-checked="true"]')?.scrollIntoView({ block: 'center' })
}

function choose(id) {
  quranStore.changeReciter(id)
  showReciters.value = false
}

const isChosen = (reciter) => reciter.id === Number(quranStore.currentReciter)

// The list is one Tab stop, on the chosen reciter (or the first, when a search hides them); the arrows move between
// reciters without choosing one, since choosing closes the sheet. Space or Enter chooses.
const focusIndex = ref(0)
watch(filtered, (list) => (focusIndex.value = Math.max(0, list.findIndex(isChosen))), { immediate: true })

function onListKeydown(event) {
  const to = rovingTarget(event.key, focusIndex.value, filtered.value.length)
  if (to === null) return
  event.preventDefault()
  focusIndex.value = to
  list.value?.querySelectorAll('[role="radio"]')[to]?.focus()
}

const reciterName = computed(() => quranStore.reciter?.name ?? 'اختر القارئ')
// Two recordings can share a reciter's name, so the player says which one is playing.
const reciterStyle = computed(() => recordingStyle(quranStore.reciter))
</script>

<template>
  <div class="player-pill" :class="{ 'is-hidden': hidden }">
    <button
      type="button"
      class="player-pill__play"
      :aria-label="playing ? 'إيقاف التلاوة' : 'تشغيل التلاوة'"
      :disabled="loading"
      @click="emit('toggle')"
    >
      <IconLoader2 v-if="loading" size="16" class="spin" aria-hidden="true" />
      <IconPlayerPauseFilled v-else-if="playing" size="16" aria-hidden="true" />
      <IconPlayerPlayFilled v-else size="16" aria-hidden="true" />
    </button>

    <button
      type="button"
      class="player-pill__reciter"
      :aria-label="`القارئ: ${reciterName}${reciterStyle ? `، ${reciterStyle}` : ''}`"
      @click="openReciters"
    >
      <span class="text-truncate">{{ reciterName }}</span>
      <small v-if="reciterStyle" class="player-pill__style">{{ reciterStyle }}</small>
      <IconChevronDown size="16" aria-hidden="true" />
    </button>

    <BottomSheet :show="showReciters" title="القارئ" @close="showReciters = false">
      <div class="reciters">
        <div class="reciters__search">
          <div class="search-field">
            <IconSearch class="search-field__icon" size="1.15rem" aria-hidden="true" />
            <input
              v-model="search"
              type="text"
              class="form-control search-field__input"
              placeholder="ابحث عن قارئ"
              aria-label="ابحث عن قارئ"
            />
          </div>
        </div>

        <ul ref="list" class="bottom-sheet-list" role="radiogroup" aria-label="القارئ" @keydown="onListKeydown">
          <li v-for="(reciter, index) in filtered" :key="reciter.id">
            <button
              type="button"
              class="bottom-sheet-item"
              role="radio"
              :aria-checked="isChosen(reciter)"
              :tabindex="index === focusIndex ? 0 : -1"
              @focus="focusIndex = index"
              @click="choose(reciter.id)"
            >
              <span class="flex-grow-1 text-truncate">{{ reciter.name }}</span>
              <small v-if="recordingStyle(reciter)" class="reciters__style">{{ recordingStyle(reciter) }}</small>
              <IconCheck v-if="isChosen(reciter)" size="20" class="reciters__check" />
            </button>
          </li>
          <li v-if="!filtered.length" class="reciters__empty">لا يوجد قارئ بهذا الاسم</li>
        </ul>
      </div>
    </BottomSheet>
  </div>
</template>

<style lang="scss" scoped>
/* An embed has no tab bar to clear. */
:global(.main-content-embed .player-pill) {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 0.75rem);
}

/* A small pill just above the tab bar: play, and who is reciting. */
.player-pill {
  position: fixed;
  inset-inline: 0;
  bottom: calc(var(--navbar-height) + env(safe-area-inset-bottom, 0px) + 0.75rem);
  z-index: 1010;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: fit-content;
  max-width: calc(100% - 2rem);
  margin-inline: auto;
  padding: 0.25rem;
  padding-inline-end: 0.5rem;
  border-radius: var(--bs-border-radius-pill);
  background: var(--app-glass);
  backdrop-filter: blur(20px) saturate(1.6);
  box-shadow:
    0 0 0 1px var(--app-hairline),
    0 8px 24px -12px rgba(18, 18, 18, 0.25);
  transition:
    transform 0.3s var(--app-ease-out),
    opacity 0.2s ease;

  // Hidden from the keyboard and screen readers too, like the bars.
  &.is-hidden {
    transform: translateY(calc(100% + var(--navbar-height) + 1rem));
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      transform 0.25s ease-in,
      opacity 0.2s ease-in,
      visibility 0s 0.25s;
  }
}

.player-pill__play {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 50%;
  background: var(--bs-primary);
  color: var(--app-on-primary);
  transition: transform 0.15s var(--app-ease-out);

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.85;
  }
}

.player-pill__reciter {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  min-height: 2.25rem;
  padding-inline: 0.5rem 0.25rem;
  border: 0;
  border-radius: var(--bs-border-radius-pill);
  background: none;
  color: var(--bs-body-color);
  font-size: 0.9375rem;
  font-weight: 500;

  svg {
    flex-shrink: 0;
    color: var(--bs-secondary-color);
  }

  &:active {
    background-color: var(--app-tint);
  }
}

.player-pill__play,
.player-pill__reciter {
  &:focus-visible {
    outline: 2px solid rgba(var(--bs-primary-rgb), 0.5);
    outline-offset: 2px;
  }
}

.reciters {
  // A fixed height, so the sheet doesn't jump as the search narrows the list; the list scrolls inside it.
  display: flex;
  flex-direction: column;
  height: min(70dvh, 36rem);
}

.reciters__search {
  flex-shrink: 0;
  padding: 0.25rem 1rem 0.5rem;
}

.reciters .bottom-sheet-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: 0.5rem;
}

.reciters__style,
.player-pill__style {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
}

.player-pill__style {
  font-size: 0.8125rem;
  font-weight: 400;
}

.reciters__check {
  color: var(--app-primary-ink) !important;
}

.reciters__empty {
  padding: 1rem;
  text-align: center;
  color: var(--bs-secondary-color);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
