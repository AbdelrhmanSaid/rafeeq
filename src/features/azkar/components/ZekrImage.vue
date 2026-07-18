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

// The data-bs-theme="light" attribute below makes Bootstrap's
// [data-bs-theme=light] rule re-declare --bs-primary/--bs-primary-rgb with the
// compiled default, hiding the user's chosen theme color. Resolve both from the
// root element (where applyPrimaryColor sets them inline) and pin them back as
// inline styles on the export root so the whole export follows the theme color.
// html2canvas also rasterizes inline SVGs without stylesheet context, so the
// logo needs the resolved color as an inline style either way.
const rootStyles = getComputedStyle(document.documentElement)
const primaryColor = rootStyles.getPropertyValue('--bs-primary').trim() || '#795547'
const primaryRgb = rootStyles.getPropertyValue('--bs-primary-rgb').trim() || '121, 85, 71'

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
    class="zekr-export"
    dir="rtl"
    lang="ar"
    data-bs-theme="light"
    :style="{ '--bs-primary': primaryColor, '--bs-primary-rgb': primaryRgb }"
  >
    <div class="frame-outer">
      <div class="frame-inner">
        <span class="corner corner-tl"><span class="corner-diamond"></span></span>
        <span class="corner corner-tr"><span class="corner-diamond"></span></span>
        <span class="corner corner-bl"><span class="corner-diamond"></span></span>
        <span class="corner corner-br"><span class="corner-diamond"></span></span>

        <div class="ornament-row">
          <span class="ornament-rule"></span>
          <span class="star8">
            <span class="star8-diamond"></span>
            <span class="star8-dot"></span>
          </span>
          <span class="ornament-rule"></span>
        </div>

        <div class="text-zone">
          <p class="font-quran zekr-text" :style="textStyle">{{ text }}</p>
        </div>

        <template v-if="reference || benefit">
          <div class="divider-row">
            <span class="divider-rule"></span>
            <span class="divider-diamond"></span>
            <span class="divider-rule"></span>
          </div>
          <p v-if="reference" class="zekr-reference">{{ reference }}</p>
          <p v-if="benefit" class="zekr-benefit">{{ benefit }}</p>
        </template>

        <div class="repeat-pill">
          <span class="pill-diamond"></span>
          <span class="pill-label">{{ repeatLabel }}</span>
          <span class="pill-diamond"></span>
        </div>
      </div>
    </div>

    <div class="export-footer" :style="{ color: primaryColor }">
      <Logo :size="20" :style="{ color: primaryColor }" />
    </div>
  </div>
</template>

<style scoped>
/*
 * Captured by html2canvas: stick to solid colors, simple linear-gradients,
 * borders and 2D transforms — no conic-gradient, color-mix, box-shadow
 * or flex gap. Ornaments are plain rotated divs for the same reason.
 */
.zekr-export {
  width: 512px;
  min-height: 560px;
  padding: 24px 24px 16px;
  background: #fffdf9;
  font-family: 'Thmanyah Sans', sans-serif;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.frame-outer {
  flex: 1 1 auto;
  display: flex;
  border: 2px solid rgba(var(--bs-primary-rgb), 0.5);
  border-radius: 8px;
  padding: 5px;
}

.frame-inner {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(var(--bs-primary-rgb), 0.3);
  border-radius: 4px;
  background: rgba(var(--bs-primary-rgb), 0.03);
  padding: 26px 30px 24px;
}

/* Corner ornaments: square + rotated square = tiny eight-pointed star */
.corner {
  position: absolute;
  width: 7px;
  height: 7px;
  background: rgba(var(--bs-primary-rgb), 0.4);
}

.corner-diamond {
  position: absolute;
  top: 0;
  left: 0;
  width: 7px;
  height: 7px;
  background: rgba(var(--bs-primary-rgb), 0.4);
  transform: rotate(45deg);
}

.corner-tl {
  top: 12px;
  right: 12px;
}

.corner-tr {
  top: 12px;
  left: 12px;
}

.corner-bl {
  bottom: 12px;
  right: 12px;
}

.corner-br {
  bottom: 12px;
  left: 12px;
}

/* Header medallion: eight-pointed star flanked by fading rules */
.ornament-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.ornament-rule {
  width: 96px;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(var(--bs-primary-rgb), 0.45), transparent);
}

.star8 {
  position: relative;
  width: 15px;
  height: 15px;
  margin: 0 14px;
  background: rgba(var(--bs-primary-rgb), 0.85);
}

.star8-diamond {
  position: absolute;
  top: 0;
  left: 0;
  width: 15px;
  height: 15px;
  background: rgba(var(--bs-primary-rgb), 0.85);
  transform: rotate(45deg);
}

.star8-dot {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fffdf9;
  z-index: 1;
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
  color: #2b2521;
  margin: 0;
  max-width: 400px;
}

.divider-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18px 0 14px;
}

.divider-rule {
  width: 56px;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(var(--bs-primary-rgb), 0.4), transparent);
}

.divider-diamond {
  width: 6px;
  height: 6px;
  margin: 0 12px;
  background: rgba(var(--bs-primary-rgb), 0.55);
  transform: rotate(45deg);
}

.zekr-reference {
  color: var(--bs-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.8;
  margin: 0 0 4px;
}

.zekr-benefit {
  color: #6e665d;
  font-size: 13.5px;
  line-height: 1.9;
  margin: 0;
  max-width: 380px;
}

.repeat-pill {
  display: inline-flex;
  align-items: center;
  margin-top: 22px;
  padding: 8px 20px;
  border-radius: 50px;
  background: rgba(var(--bs-primary-rgb), 0.07);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.22);
}

.pill-diamond {
  width: 5px;
  height: 5px;
  margin: 0 10px;
  background: rgba(var(--bs-primary-rgb), 0.55);
  transform: rotate(45deg);
}

.pill-label {
  color: var(--bs-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.export-footer {
  display: flex;
  justify-content: center;
  padding-top: 14px;
  opacity: 0.9;
}
</style>
