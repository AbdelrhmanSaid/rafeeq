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

// Resolve the theme color from the root element (where applyPrimaryColor sets
// it inline) instead of relying on CSS custom properties inside the export:
// html2canvas rasterizes the card without full stylesheet context, and the
// data-bs-theme="light" attribute would re-declare the vars anyway.
const rootStyles = getComputedStyle(document.documentElement)
const primaryColor = rootStyles.getPropertyValue('--bs-primary').trim() || '#795547'
const primaryRgb = rootStyles.getPropertyValue('--bs-primary-rgb').trim() || '121, 85, 71'
const primary = (alpha) => `rgba(${primaryRgb}, ${alpha})`

// Sizes are px (not rem) so the user's font-scale setting can't distort exports
const textSize = computed(() => {
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

/*
 * Every style below is INLINE on purpose — do not move them to a <style>
 * block. The card is mounted off-screen and rasterized by html2canvas, and a
 * stale service-worker update can leave the app running with CSS whose scoped
 * data-v hashes no longer match this component: the card then mounts unstyled
 * and exports as a huge white strip. Inline styles ship inside this JS chunk,
 * so they are always exactly as deployed with the component.
 *
 * Also captured by html2canvas: stick to solid colors, simple
 * linear-gradients, borders and 2D transforms — no conic-gradient,
 * color-mix, box-shadow or flex gap. Ornaments are plain rotated divs.
 */
const st = {
  root: {
    'width': '512px',
    'minHeight': '560px',
    'padding': '24px 24px 16px',
    'background': '#fffdf9',
    'fontFamily': "'Thmanyah Sans', sans-serif",
    'display': 'flex',
    'flexDirection': 'column',
    'textAlign': 'center',
    'boxSizing': 'border-box',
    '--bs-primary': primaryColor,
    '--bs-primary-rgb': primaryRgb,
  },
  frameOuter: {
    flex: '1 1 auto',
    display: 'flex',
    border: `2px solid ${primary(0.5)}`,
    borderRadius: '8px',
    padding: '5px',
    boxSizing: 'border-box',
  },
  frameInner: {
    position: 'relative',
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: `1px solid ${primary(0.3)}`,
    borderRadius: '4px',
    background: primary(0.03),
    padding: '26px 30px 24px',
    boxSizing: 'border-box',
  },
  // Corner ornaments: square + rotated square = tiny eight-pointed star
  corner: {
    position: 'absolute',
    width: '7px',
    height: '7px',
    background: primary(0.4),
  },
  cornerDiamond: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '7px',
    height: '7px',
    background: primary(0.4),
    transform: 'rotate(45deg)',
  },
  cornerTl: { top: '12px', right: '12px' },
  cornerTr: { top: '12px', left: '12px' },
  cornerBl: { bottom: '12px', right: '12px' },
  cornerBr: { bottom: '12px', left: '12px' },
  // Header medallion: eight-pointed star flanked by fading rules
  ornamentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  ornamentRule: {
    width: '96px',
    height: '2px',
    background: `linear-gradient(to right, transparent, ${primary(0.45)}, transparent)`,
  },
  star8: {
    position: 'relative',
    width: '15px',
    height: '15px',
    margin: '0 14px',
    background: primary(0.85),
  },
  star8Diamond: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '15px',
    height: '15px',
    background: primary(0.85),
    transform: 'rotate(45deg)',
  },
  star8Dot: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#fffdf9',
    zIndex: 1,
  },
  textZone: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '6px 0',
    boxSizing: 'border-box',
  },
  zekrText: {
    color: '#2b2521',
    margin: '0',
    maxWidth: '400px',
    fontFamily: "'Kitab', 'Thmanyah Sans', sans-serif",
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '18px 0 14px',
  },
  dividerRule: {
    width: '56px',
    height: '1px',
    background: `linear-gradient(to right, transparent, ${primary(0.4)}, transparent)`,
  },
  dividerDiamond: {
    width: '6px',
    height: '6px',
    margin: '0 12px',
    background: primary(0.55),
    transform: 'rotate(45deg)',
  },
  reference: {
    color: primaryColor,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.8,
    margin: '0 0 4px',
  },
  benefit: {
    color: '#6e665d',
    fontSize: '13.5px',
    lineHeight: 1.9,
    margin: '0',
    maxWidth: '380px',
  },
  repeatPill: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: '22px',
    padding: '8px 20px',
    borderRadius: '50px',
    background: primary(0.07),
    border: `1px solid ${primary(0.22)}`,
    boxSizing: 'border-box',
  },
  pillDiamond: {
    width: '5px',
    height: '5px',
    margin: '0 10px',
    background: primary(0.55),
    transform: 'rotate(45deg)',
  },
  pillLabel: {
    color: primaryColor,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '14px',
    opacity: 0.9,
    color: primaryColor,
  },
}
</script>

<template>
  <div class="zekr-export" dir="rtl" lang="ar" data-bs-theme="light" :style="st.root">
    <div :style="st.frameOuter">
      <div :style="st.frameInner">
        <span :style="[st.corner, st.cornerTl]"><span :style="st.cornerDiamond"></span></span>
        <span :style="[st.corner, st.cornerTr]"><span :style="st.cornerDiamond"></span></span>
        <span :style="[st.corner, st.cornerBl]"><span :style="st.cornerDiamond"></span></span>
        <span :style="[st.corner, st.cornerBr]"><span :style="st.cornerDiamond"></span></span>

        <div :style="st.ornamentRow">
          <span :style="st.ornamentRule"></span>
          <span :style="st.star8">
            <span :style="st.star8Diamond"></span>
            <span :style="st.star8Dot"></span>
          </span>
          <span :style="st.ornamentRule"></span>
        </div>

        <div :style="st.textZone">
          <p class="font-quran" :style="[st.zekrText, textSize]">{{ text }}</p>
        </div>

        <template v-if="reference || benefit">
          <div :style="st.dividerRow">
            <span :style="st.dividerRule"></span>
            <span :style="st.dividerDiamond"></span>
            <span :style="st.dividerRule"></span>
          </div>
          <p v-if="reference" :style="st.reference">{{ reference }}</p>
          <p v-if="benefit" :style="st.benefit">{{ benefit }}</p>
        </template>

        <div :style="st.repeatPill">
          <span :style="st.pillDiamond"></span>
          <span :style="st.pillLabel">{{ repeatLabel }}</span>
          <span :style="st.pillDiamond"></span>
        </div>
      </div>
    </div>

    <div :style="st.footer">
      <Logo :size="20" :style="{ color: primaryColor }" />
    </div>
  </div>
</template>
