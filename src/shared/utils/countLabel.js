import { toArabicNumerals } from '@/shared/utils/arabic'

// Arabic count agreement (as an object, e.g. after "تم تصدير"): 1 and 2 name the noun alone; otherwise, by the last
// two digits, 3–10 take the plural, 11–99 the accusative singular, and the rest (0, 100, 102…) the singular.
export function countLabel(count, { one, two, few, many, other }) {
  if (count === 1) return one
  if (count === 2) return two
  const number = toArabicNumerals(count)
  const lastTwo = count % 100
  if (lastTwo >= 3 && lastTwo <= 10) return `${number} ${few}`
  if (lastTwo >= 11) return `${number} ${many}`
  return `${number} ${other}`
}
