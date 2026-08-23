import Logo from '@/shared/ui/Logo'
import { toArabicNumerals } from '@/shared/utils/arabic'
import styles from './ZekrImage.module.scss'

// Sizes are px (not rem) so the user's font-scale setting can't distort exports.
function textStyle(text) {
  const length = text.length
  if (length <= 60) return { fontSize: '30px', lineHeight: 2.1 }
  if (length <= 160) return { fontSize: '26px', lineHeight: 2.05 }
  if (length <= 320) return { fontSize: '23px', lineHeight: 2 }
  if (length <= 600) return { fontSize: '20px', lineHeight: 1.95 }
  return { fontSize: '18px', lineHeight: 1.9 }
}

function repeatLabel(repeat) {
  if (repeat === 2) return 'يُردَّد مرتين'
  if (repeat >= 3 && repeat <= 10) return `يُردَّد ${toArabicNumerals(repeat)} مرات`
  if (repeat > 10) return `يُردَّد ${toArabicNumerals(repeat)} مرة`
  return 'يُردَّد مرة واحدة'
}

// The data-bs-theme="light" attribute below makes Bootstrap's
// [data-bs-theme=light] rule re-declare --bs-primary/--bs-primary-rgb with the
// compiled default, hiding the user's chosen theme color. Resolve both from the
// root element (where applyPrimaryColor sets them inline) and pin them back as
// inline styles on the export root so the whole export follows the theme color.
// html2canvas also rasterizes inline SVGs without stylesheet context, so the
// logo needs the resolved color as an inline style either way.
function themeColors() {
  const rootStyles = getComputedStyle(document.documentElement)

  return {
    primaryColor: rootStyles.getPropertyValue('--bs-primary').trim() || '#795547',
    primaryRgb: rootStyles.getPropertyValue('--bs-primary-rgb').trim() || '121, 85, 71',
  }
}

// Printable card rendered off-screen and rasterized by exportElement().
export default function ZekrImage({ text, repeat, reference, benefit }) {
  const { primaryColor, primaryRgb } = themeColors()

  return (
    <div
      className={styles.export}
      dir="rtl"
      lang="ar"
      data-bs-theme="light"
      style={{ '--bs-primary': primaryColor, '--bs-primary-rgb': primaryRgb }}
    >
      <div className={styles.frameOuter}>
        <div className={styles.frameInner}>
          <span className={`${styles.corner} ${styles.cornerTopLeft}`}>
            <span className={styles.cornerDiamond}></span>
          </span>
          <span className={`${styles.corner} ${styles.cornerTopRight}`}>
            <span className={styles.cornerDiamond}></span>
          </span>
          <span className={`${styles.corner} ${styles.cornerBottomLeft}`}>
            <span className={styles.cornerDiamond}></span>
          </span>
          <span className={`${styles.corner} ${styles.cornerBottomRight}`}>
            <span className={styles.cornerDiamond}></span>
          </span>

          <div className={styles.ornamentRow}>
            <span className={styles.ornamentRule}></span>
            <span className={styles.star}>
              <span className={styles.starDiamond}></span>
              <span className={styles.starDot}></span>
            </span>
            <span className={styles.ornamentRule}></span>
          </div>

          <div className={styles.textZone}>
            <p className={`font-quran ${styles.text}`} style={textStyle(text)}>
              {text}
            </p>
          </div>

          {(reference || benefit) && (
            <>
              <div className={styles.dividerRow}>
                <span className={styles.dividerRule}></span>
                <span className={styles.dividerDiamond}></span>
                <span className={styles.dividerRule}></span>
              </div>
              {reference && <p className={styles.reference}>{reference}</p>}
              {benefit && <p className={styles.benefit}>{benefit}</p>}
            </>
          )}

          <div className={styles.repeatPill}>
            <span className={styles.pillDiamond}></span>
            <span className={styles.pillLabel}>{repeatLabel(repeat)}</span>
            <span className={styles.pillDiamond}></span>
          </div>
        </div>
      </div>

      <div className={styles.footer} style={{ color: primaryColor }}>
        <Logo size={20} style={{ color: primaryColor }} />
      </div>
    </div>
  )
}
