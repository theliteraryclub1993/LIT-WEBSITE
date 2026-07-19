import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility to merge tailwind classes dynamically resolving overrides
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
