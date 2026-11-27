<script setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { IconCheck, IconChevronDown, IconLoader2, IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-vue'
import reciters from '@/features/quran/data/reciters.js'
import { useQuranStore } from '@/features/quran/store'
import { useSearch } from '@/shared/composables/useSearch'
import BottomSheet from '@/shared/ui/BottomSheet.vue'

defineProps({
  playing: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const quranStore = useQuranStore()

// The Mushaf is in Hafs, so the list offers the reciters who recorded the whole Quran in it, murattal or mujawwad,
// plus whoever was picked in Settings.
const HAFS = new Set(['حفص عن عاصم', 'المصحف المجود'])
const choices = computed(() =>
  reciters.filter(
    (r) =>
      (r.soar_count >= 114 && HAFS.has(r.rewaya.replace(/\s+/g, ' ').trim())) ||
      r.id === Number(quranStore.currentReciter),
  ),
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

const reciterName = computed(() => quranStore.reciter?.name ?? 'اختر القارئ')
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
      <IconLoader2 v-if="loading" size="20" class="spin" aria-hidden="true" />
      <IconPlayerPauseFilled v-else-if="playing" size="20" aria-hidden="true" />
      <IconPlayerPlayFilled v-else size="20" aria-hidden="true" />
    </button>

    <button type="button" class="player-pill__reciter" :aria-label="`القارئ: ${reciterName}`" @click="openReciters">
      <span class="text-truncate">{{ reciterName }}</span>
      <IconChevronDown size="16" aria-hidden="true" />
    </button>

    <BottomSheet :show="showReciters" title="القارئ" @close="showReciters = false">
      <div class="reciters">
        <div class="search-field">
          <input
            v-model="search"
            type="search"
            class="form-control"
            placeholder="ابحث عن قارئ"
            aria-label="ابحث عن قارئ"
          />
        </div>

        <ul ref="list" class="bottom-sheet-list" role="radiogroup" aria-label="القارئ">
          <li v-for="reciter in filtered" :key="reciter.id">
            <button
              type="button"
              class="bottom-sheet-item"
              role="radio"
              :aria-checked="reciter.id === Number(quranStore.currentReciter)"
              @click="choose(reciter.id)"
            >
              <span class="flex-grow-1 text-truncate">{{ reciter.name }}</span>
              <small v-if="reciter.rewaya.includes('المجود')" class="reciters__style">مجوّد</small>
              <IconCheck v-if="reciter.id === Number(quranStore.currentReciter)" size="20" class="reciters__check" />
            </button>
          </li>
          <li v-if="!filtered.length" class="reciters__empty">لا يوجد قارئ بهذا الاسم</li>
        </ul>
      </div>
    </BottomSheet>
  </div>
</template>

<style lang="scss" scoped>
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

  &.is-hidden {
    transform: translateY(calc(100% + var(--navbar-height) + 1rem));
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.25s ease-in,
      opacity 0.2s ease-in;
  }
}

.player-pill__play {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 50%;
  background: var(--bs-primary);
  color: #fff;
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
  min-height: 2.5rem;
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
  padding-bottom: 0.5rem;
}

.reciters .search-field {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.25rem 1rem 0.5rem;
  background-color: var(--app-surface);

  .form-control {
    height: 2.5rem;
    border-color: var(--app-hairline);
    background-color: color-mix(in srgb, var(--bs-body-color) 6%, transparent);
  }
}

.reciters__style {
  flex-shrink: 0;
  color: var(--bs-secondary-color);
}

.reciters__check {
  color: var(--bs-primary) !important;
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
