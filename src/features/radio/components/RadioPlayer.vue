<script setup>
import { IconHeart, IconHeartFilled, IconPlayerPause, IconPlayerPlay, IconShare3, IconRadio } from '@tabler/icons-vue'
import BackButton from '@/shared/ui/BackButton.vue'
import { Button } from '@/shared/components/ui/button'

defineProps({
  station: { type: Object, required: true },
  isPlaying: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  canShare: { type: Boolean, default: false },
})

defineEmits(['toggle', 'favorite', 'share'])
</script>

<template>
  <div class="mx-auto w-full max-w-lg">
    <!-- Navigation Header -->
    <div class="embed-hidden mb-6 flex items-center justify-between gap-2">
      <BackButton :to="{ name: 'radio' }" />

      <Button
        variant="ghost"
        type="button"
        class="h-11 gap-2 rounded-full px-5 text-muted-foreground active:scale-[0.98]"
        @click="$emit('share')"
        v-if="canShare"
      >
        <IconShare3 class="size-5" />
        <span>مشاركة</span>
      </Button>
    </div>

    <!-- Station hero: the artwork disc carries the playing state (the ripples
         only run while the stream is live), the name leads. -->
    <div class="surface-hero flex flex-col items-center gap-6 rounded-3xl px-5 py-10 text-center shadow-sm">
      <div class="relative grid size-56 shrink-0 place-items-center">
        <!-- Sound Waves -->
        <div class="sound-waves pointer-events-none absolute inset-0 z-0" :class="{ active: isPlaying }">
          <span
            v-for="i in 3"
            :key="i"
            class="wave absolute inset-0 rounded-full border border-primary"
            :style="{ '--i': i }"
          ></span>
        </div>

        <div class="relative z-10 grid size-40 place-items-center rounded-full bg-card shadow-md ring-1 ring-border/50">
          <div class="grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <IconRadio class="size-11" />
          </div>
        </div>
      </div>

      <h1 class="text-2xl text-balance sm:text-3xl">{{ station.name }}</h1>
    </div>

    <!-- Secondary actions and the source note stay above the docked transport. -->
    <div class="mt-6 flex flex-col items-center gap-4">
      <Button
        variant="ghost"
        type="button"
        class="embed-hidden h-11 gap-2 rounded-full px-5 active:scale-[0.98]"
        :class="isFavorite ? 'text-destructive hover:text-destructive' : 'text-muted-foreground'"
        @click="$emit('favorite')"
      >
        <IconHeartFilled v-if="isFavorite" class="size-5" />
        <IconHeart v-else class="size-5" />
        <span>{{ isFavorite ? 'في المفضلة' : 'إضافة للمفضلة' }}</span>
      </Button>

      <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
        يتم تشغيل البث المباشر من مصدره الرسمي بجودة عالية
      </p>
    </div>

    <!-- Reserves the height the fixed transport below occupies, so the note is
         never hidden under it. -->
    <div class="h-28" aria-hidden="true"></div>

    <!-- The transport docks to the bottom like the Quran player: on the phone it
         sits directly above the floating tab bar (navbar height plus the
         home-indicator inset) and stays under that bar's `z-40`; from `md` the
         tab bar is gone and it rests on the bottom edge. -->
    <div
      class="fixed inset-x-0 bottom-[calc(var(--navbar-height)_+_env(safe-area-inset-bottom,0px))] z-30 md:bottom-0 md:pb-4"
    >
      <div class="mx-auto w-full max-w-lg px-3 pb-2 sm:px-4">
        <div
          class="flex items-center gap-3 rounded-3xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur-xl"
        >
          <Button
            type="button"
            size="icon"
            class="size-14 shrink-0 rounded-full shadow-sm active:scale-95"
            @click="$emit('toggle')"
          >
            <IconPlayerPause v-if="isPlaying" class="size-6" />
            <IconPlayerPlay v-else class="size-6" />
          </Button>

          <div class="min-w-0 flex-1 text-start leading-tight">
            <span class="block truncate text-sm font-medium">{{ station.name }}</span>
            <span class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span
                class="size-2 shrink-0 rounded-full bg-muted-foreground transition-colors"
                :class="{ live: isPlaying }"
              ></span>
              <span class="truncate">{{ isPlaying ? 'البث المباشر جارٍ الآن' : 'جاهز للتشغيل' }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The live dot and the ripple loop need real CSS (a keyframe and a glow ring);
   colors still come from the tokens so runtime theming keeps working. */
.live {
  background: var(--success);
  box-shadow: 0 0 0 0.125rem color-mix(in srgb, var(--success) 20%, transparent);
}

.wave {
  opacity: 0;
  transform: scale(0.8);
}

/* Each ripple is offset by its index so the three rings chase each other. */
.sound-waves.active .wave {
  animation: ripple 2.4s ease-out infinite;
  animation-delay: calc(var(--i) * 0.4s);
}

@keyframes ripple {
  0% {
    transform: scale(0.72);
    opacity: 0.35;
  }

  100% {
    transform: scale(1.05);
    opacity: 0;
  }
}
</style>
