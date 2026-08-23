<script setup>
import { computed } from 'vue'
import Logo from '@/shared/ui/Logo.vue'
import { toArabicNumerals } from '@/shared/utils/arabic'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  repeat: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
  },
  benefit: {
    type: String,
  },
})

const PRIMARY_FALLBACK = '#795547'

const readPrimaryChannels = () => {
  const token = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()

  const probe = document.createElement('div')
  probe.style.color = PRIMARY_FALLBACK
  if (token) probe.style.color = token
  document.body.appendChild(probe)

  const resolved = getComputedStyle(probe).color
  probe.remove()

  return (
    resolved
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number) ?? [121, 85, 71]
  )
}

const [red, green, blue] = readPrimaryChannels()
const primaryColor = `rgb(${red}, ${green}, ${blue})`
const primaryRgb = `${red}, ${green}, ${blue}`

// Sizes are px (not rem) so the user's font-scale setting can't distort exports
const textStyle = computed(() => {
  const len = props.text.length
  if (len <= 60) return { fontSize: '30px', lineHeight: 2.1 }
  if (len <= 160) return { fontSize: '26px', lineHeight: 2.05 }
  if (len <= 320) return { fontSize: '23px', lineHeight: 2 }
  if (len <= 600) return { fontSize: '20px', lineHeight: 1.95 }
  return { fontSize: '18px', lineHeight: 1.9 }
})

const repeatLabel = computed(() => {
  const n = props.repeat
  if (n === 2) return 'يُردَّد مرتين'
  if (n >= 3 && n <= 10) return `يُردَّد ${toArabicNumerals(n)} مرات`
  if (n > 10) return `يُردَّد ${toArabicNumerals(n)} مرة`
  return 'يُردَّد مرة واحدة'
})
</script>
<template>
  <div
    class="zekr-export theme-light"
    dir="rtl"
    lang="ar"
    :style="{ '--primary': primaryColor, '--zekr-primary-rgb': primaryRgb }"
  >
    <div class="export-card">
      <div class="repeat-pill">{{ repeatLabel }}</div>
      <div class="text-zone">
        <p class="font-quran zekr-text" :style="textStyle">{{ text }}</p>
      </div>
      <template v-if="reference || benefit">
        <span class="divider"></span>
        <p v-if="reference" class="zekr-reference">{{ reference }}</p>
        <p v-if="benefit" class="zekr-benefit">{{ benefit }}</p>
      </template>
    </div>
    <div class="export-footer" :style="{ color: primaryColor }">
      <Logo :size="20" :style="{ color: primaryColor }" />
    </div>
  </div>
</template>
<style scoped>
.zekr-export {
  width: 512px;
  min-height: 560px;
  padding: 24px 24px 16px;
  background: var(--background);
  font-family: 'Thmanyah Sans', sans-serif;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.export-card {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--card);
  border: 1px solid rgba(var(--zekr-primary-rgb), 0.16);
  border-radius: 28px;
  padding: 30px 30px 34px;
}

.repeat-pill {
  padding: 7px 18px;
  margin-bottom: 24px;
  border-radius: 999px;
  border: 1px solid rgba(var(--zekr-primary-rgb), 0.2);
  background: rgba(var(--zekr-primary-rgb), 0.08);
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.text-zone {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 6px 0;
}

.zekr-text {
  color: var(--foreground);
  margin: 0;
  max-width: 400px;
}

.divider {
  width: 48px;
  height: 2px;
  border-radius: 2px;
  margin: 26px 0 16px;
  background: rgba(var(--zekr-primary-rgb), 0.3);
}

.zekr-reference {
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.7;
  margin: 0 0 6px;
  max-width: 380px;
}

.zekr-benefit {
  color: var(--muted-foreground);
  font-size: 13.5px;
  line-height: 1.85;
  margin: 0;
  max-width: 380px;
}

.export-footer {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  opacity: 0.9;
}
</style>
