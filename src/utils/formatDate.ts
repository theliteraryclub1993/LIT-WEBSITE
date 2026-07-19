import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export function formatDate(dateString: string | null | undefined, pattern: string = 'MMM d, yyyy'): string {
  if (!dateString) return '—'

  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return '—'
    return format(date, pattern)
  } catch {
    return '—'
  }
}

export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'

  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return '—'
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'MMM d, yyyy h:mm a')
}

export function formatTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'h:mm a')
}