import { toArabicNumerals } from '@/shared/utils/arabic'

// A count with its noun in the form Arabic gives it after that number, as the object of a phrase such as
// "تم تصدير …": one and two name the noun alone, 3 to 10 take the plural, 11 to 99 the singular in the accusative,
// and 100, 200… the singular again. `forms` is { one, two, few, many, other }, e.g. for عنصر:
// { one: 'عنصر واحد', two: 'عنصرين', few: 'عناصر', many: 'عنصرًا', other: 'عنصر' }.
export function countLabel(count, { one, two, few, many, other }) {
  if (count === 1) return one
  if (count === 2) return two
  const number = toArabicNumerals(count)
  const lastTwo = count % 100
  if (lastTwo >= 3 && lastTwo <= 10) return `${number} ${few}`
  if (lastTwo >= 11) return `${number} ${many}`
  return `${number} ${other}`
}

export const ITEM_FORMS = { one: 'عنصر واحد', two: 'عنصرين', few: 'عناصر', many: 'عنصرًا', other: 'عنصر' }
