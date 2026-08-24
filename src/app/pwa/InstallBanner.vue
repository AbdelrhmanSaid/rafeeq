<script setup>
import { IconDownload, IconX } from '@tabler/icons-vue'
import { useInstallPrompt } from '@/app/pwa/useInstallPrompt'

const { canInstall, install, dismiss } = useInstallPrompt()
</script>

<template>
  <Transition name="install-banner">
    <div v-if="canInstall" class="install-banner" role="region" aria-label="تثبيت التطبيق">
      <span class="icon-tile flex-shrink-0"><IconDownload size="1.25rem" aria-hidden="true" /></span>

      <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold install-banner__title">ثبّت رفيق على جهازك</div>
        <div class="small text-secondary install-banner__subtitle">وصول أسرع، ويعمل بدون إنترنت</div>
      </div>

      <button
        type="button"
        class="btn btn-primary btn-sm rounded-pill px-3 flex-shrink-0 install-banner__install"
        @click="install"
      >
        تثبيت
      </button>

      <button
        type="button"
        class="btn btn-icon btn-flat rounded-circle flex-shrink-0"
        aria-label="إخفاء"
        @click="dismiss"
      >
        <IconX size="1.1rem" />
      </button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.install-banner {
  position: fixed;
  /* Clear the mobile tab bar (and the iPhone home indicator it grows by). */
  bottom: calc(var(--navbar-height) + env(safe-area-inset-bottom, 0px) + 0.75rem);
  inset-inline: 0.75rem;
  z-index: 1030;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem 0.75rem;
  max-width: 26rem;
  margin-inline: auto;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--app-hairline);
  border-radius: 1rem;
  background: var(--app-glass);
  backdrop-filter: blur(18px) saturate(1.4);
  box-shadow: var(--app-shadow-card-hover);

  .icon-tile {
    color: var(--bs-primary);
  }

  /* One line each, always — the layout makes room instead of wrapping text. */
  &__title,
  &__subtitle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__title {
    font-size: 0.95rem;
  }

  /* Mobile: the install button leaves the text row and takes a full row of
     its own (after the close button), so the text never gets squeezed. */
  &__install {
    order: 5;
    width: 100%;
    padding-block: 0.45rem;
  }
}

/* No tab bar on desktop — dock the card into the corner, back to one row. */
@media (min-width: 768px) {
  .install-banner {
    bottom: 1.25rem;
    inset-inline: auto 1.25rem;
    margin-inline: 0;
    width: 26rem;
    flex-wrap: nowrap;

    &__install {
      order: 0;
      width: auto;
      padding-block: 0.25rem;
    }
  }
}

[data-bs-theme='dark'] .install-banner .icon-tile {
  color: color-mix(in srgb, var(--bs-primary) 28%, #fff);
}

.install-banner-enter-active,
.install-banner-leave-active {
  transition:
    transform 0.35s var(--app-ease),
    opacity 0.35s var(--app-ease);
}

.install-banner-enter-from,
.install-banner-leave-to {
  transform: translateY(0.75rem);
  opacity: 0;
}
</style>
