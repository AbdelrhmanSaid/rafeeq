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
  <div class="relative mx-auto w-full max-w-lg">
    <!-- Navigation Header -->
    <div class="embed-hidden relative z-10 mb-6 flex justify-between">
      <BackButton :to="{ name: 'radio' }" />

      <Button variant="ghost" type="button" @click="$emit('share')" v-if="canShare">
        <IconShare3 class="size-5" />
        <span>مشاركة</span>
      </Button>
    </div>

    <!-- Player Content -->
    <div class="relative z-10 flex flex-col items-center text-center">
      <!-- Vinyl/Disc Animation -->
      <div class="relative mb-12 flex size-60 items-center justify-center">
        <div
          class="relative z-10 size-50 rounded-full border bg-secondary shadow-xl transition-transform"
          :class="{ spinning: isPlaying }"
        >
          <div class="absolute inset-0 m-auto grid size-20 place-items-center rounded-full bg-primary shadow-inner">
            <div class="grid size-12 place-items-center rounded-full bg-primary-foreground/20 text-primary-foreground">
              <IconRadio class="size-8" />
            </div>
          </div>

          <div class="disc-grooves pointer-events-none absolute inset-6 rounded-full"></div>
        </div>

        <!-- Sound Waves -->
        <div class="sound-waves pointer-events-none absolute inset-0 z-0" :class="{ active: isPlaying }">
          <span
            v-for="i in 3"
            :key="i"
            class="wave absolute inset-0 rounded-full border border-primary"
            :style="{ '--i': i }"
          ></span>
        </div>
      </div>

      <!-- Station Info -->
      <div class="mb-12">
        <h1 class="mb-2 text-3xl font-bold">{{ station.name }}</h1>
        <p class="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span class="size-2 rounded-full bg-muted-foreground transition-colors" :class="{ live: isPlaying }"></span>
          {{ isPlaying ? 'البث المباشر جارٍ الآن' : 'جاهز للتشغيل' }}
        </p>
      </div>

      <!-- Controls -->
      <div class="mb-6 flex w-full flex-col items-center gap-6">
        <!-- Main Play Button -->
        <Button
          type="button"
          size="icon"
          :variant="isPlaying ? 'destructive' : 'default'"
          class="size-20 rounded-full transition-transform hover:scale-105 active:scale-95 md:size-24"
          @click="$emit('toggle')"
        >
          <IconPlayerPause v-if="isPlaying" class="size-10" />
          <IconPlayerPlay v-else class="size-10" />
        </Button>

        <!-- Favorite Button -->
        <Button
          variant="ghost"
          type="button"
          class="embed-hidden"
          :class="isFavorite ? 'text-destructive' : 'text-foreground'"
          @click="$emit('favorite')"
        >
          <IconHeartFilled v-if="isFavorite" class="size-6" />
          <IconHeart v-else class="size-6" />
          <span>{{ isFavorite ? 'في المفضلة' : 'إضافة للمفضلة' }}</span>
        </Button>
      </div>

      <!-- Footer Note -->
      <p class="text-sm text-muted-foreground opacity-75">يتم تشغيل البث المباشر من مصدره الرسمي بجودة عالية</p>
    </div>
  </div>
</template>

<style scoped>
/* The record grooves are a repeating radial gradient and the spin/ripple loops
   need keyframes — neither is expressible as a utility. Colors still come from
   the tokens so runtime theming keeps working. */
.disc-grooves {
  background: repeating-radial-gradient(
    circle at center,
    transparent 0,
    transparent 0.125rem,
    color-mix(in srgb, var(--foreground) 8%, transparent) 0.1875rem,
    transparent 0.25rem
  );
}

.spinning {
  animation: disc-spin 8s linear infinite;
}

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
  animation: ripple 2s ease-out infinite;
  animation-delay: calc(var(--i) * 0.4s);
}

@keyframes disc-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }

  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
</style>
