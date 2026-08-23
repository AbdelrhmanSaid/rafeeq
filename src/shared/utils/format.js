import { toArabicNumerals } from '@/shared/utils/arabic'

export function formatNumber(value) {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCurrency(value, currency = 'EGP') {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// 12-hour clock (e.g. "٠٨:٠٥ م") for prayer timings and other schedule rows.
export function formatClockTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const hours = date.getHours()
  const meridiem = hours < 12 ? 'ص' : 'م'
  const hour = String(hours % 12 || 12).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return toArabicNumerals(`${hour}:${minute}`) + ` ${meridiem}`
}
