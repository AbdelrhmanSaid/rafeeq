import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names, letting later Tailwind utilities win over
 * earlier conflicting ones.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
