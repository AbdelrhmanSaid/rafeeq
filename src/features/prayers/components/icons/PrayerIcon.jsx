import { prayerIcons } from './prayerIcons'

// The icon set is authored as raw SVG markup, so each icon is injected as the
// inner markup of a shared <svg> wrapper.
export default function PrayerIcon({ name }) {
  const icon = prayerIcons[name]
  if (!icon) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={icon.width}
      height={icon.height}
      viewBox={icon.viewBox}
      dangerouslySetInnerHTML={{ __html: icon.inner }}
    />
  )
}
