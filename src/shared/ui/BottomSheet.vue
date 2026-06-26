<script setup>
import { IconX } from '@tabler/icons-vue'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="show"
        class="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-end bottom-sheet-overlay"
        @click="$emit('close')"
      >
        <div class="bg-body rounded-top-3 bottom-sheet" @click.stop>
          <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h5 class="mb-0">{{ title }}</h5>
            <button class="btn btn-sm" @click="$emit('close')" aria-label="إغلاق">
              <IconX size="1.25rem" />
            </button>
          </div>

          <div class="bottom-sheet-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.bottom-sheet-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.bottom-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 85vh;
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.bottom-sheet-body {
  min-height: 0;
  overflow-y: auto;
}

/* <Transition name="sheet"> — overlay fades, panel slides up from the bottom. */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease-out;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-active .bottom-sheet,
.sheet-leave-active .bottom-sheet {
  transition: transform 0.3s ease-out;
}

.sheet-enter-from .bottom-sheet,
.sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}

/* Desktop (>= lg): center it and swap the slide for a soft fade + scale. */
@media (min-width: 992px) {
  .bottom-sheet-overlay {
    align-items: center !important;
    justify-content: center;
    padding: 1rem;
  }

  .bottom-sheet {
    max-width: 500px;
    border-radius: var(--bs-border-radius-xl) !important;
  }

  .sheet-leave-active {
    transition: opacity 0.18s ease-in;
  }

  .sheet-enter-active .bottom-sheet {
    /* Slightly-overshooting deceleration so the panel settles in place. */
    transition:
      transform 0.3s cubic-bezier(0.34, 1.32, 0.64, 1),
      opacity 0.3s ease-out;
  }

  .sheet-leave-active .bottom-sheet {
    transition:
      transform 0.18s ease-in,
      opacity 0.18s ease-in;
  }

  .sheet-enter-from .bottom-sheet,
  .sheet-leave-to .bottom-sheet {
    opacity: 0;
  }

  .sheet-enter-from .bottom-sheet {
    transform: translateY(20px) scale(0.96);
  }

  .sheet-leave-to .bottom-sheet {
    transform: translateY(10px) scale(0.97);
  }
}
</style>
