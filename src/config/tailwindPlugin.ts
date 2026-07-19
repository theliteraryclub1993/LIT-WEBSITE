/**
 * Tailwind v4 custom plugin helpers.
 * Since Tailwind v4 uses CSS-first config, these utilities
 * are defined in index.css via @layer utilities.
 * This file exports helper functions for dynamic class generation.
 */

export function getAnimationDelay(index: number, baseMs: number = 75): string {
    return `${index * baseMs}ms`
}

export function getStaggerClass(index: number): string {
    const maxStagger = 8
    const clamped = Math.min(index + 1, maxStagger)
    return `stagger-${clamped}`
}

export function getOpacityForIndex(index: number, total: number): number {
    if (total <= 1) return 1
    return 0.3 + (0.7 * (index / (total - 1)))
}

/**
 * Generates a custom CSS variable value for a gradient angle.
 */
export function gradientAngle(degrees: number): string {
    return `${degrees}deg`
}

/**
 * Maps a status string to a color class prefix.
 */
export function statusColor(status: string): {
    bg: string
    text: string
    border: string
    dot: string
} {
    const map: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        active: {
            bg: 'bg-success-subtle',
            text: 'text-success-light',
            border: 'border-success-border',
            dot: 'bg-success',
        },
        published: {
            bg: 'bg-success-subtle',
            text: 'text-success-light',
            border: 'border-success-border',
            dot: 'bg-success',
        },
        completed: {
            bg: 'bg-success-subtle',
            text: 'text-success-light',
            border: 'border-success-border',
            dot: 'bg-success',
        },
        selected: {
            bg: 'bg-success-subtle',
            text: 'text-success-light',
            border: 'border-success-border',
            dot: 'bg-success',
        },
        draft: {
            bg: 'bg-dark-800',
            text: 'text-dark-300',
            border: 'border-dark-600',
            dot: 'bg-dark-400',
        },
        pending: {
            bg: 'bg-warning-subtle',
            text: 'text-warning-light',
            border: 'border-warning-border',
            dot: 'bg-warning',
        },
        ongoing: {
            bg: 'bg-orange-subtle',
            text: 'text-orange-light',
            border: 'border-orange-border',
            dot: 'bg-orange-primary',
        },
        open: {
            bg: 'bg-orange-subtle',
            text: 'text-orange-light',
            border: 'border-orange-border',
            dot: 'bg-orange-primary',
        },
        shortlisted: {
            bg: 'bg-info-subtle',
            text: 'text-info-light',
            border: 'border-info-border',
            dot: 'bg-info',
        },
        in_review: {
            bg: 'bg-info-subtle',
            text: 'text-info-light',
            border: 'border-info-border',
            dot: 'bg-info',
        },
        cancelled: {
            bg: 'bg-error-subtle',
            text: 'text-error-light',
            border: 'border-error-border',
            dot: 'bg-error',
        },
        rejected: {
            bg: 'bg-error-subtle',
            text: 'text-error-light',
            border: 'border-error-border',
            dot: 'bg-error',
        },
        archived: {
            bg: 'bg-dark-800',
            text: 'text-dark-400',
            border: 'border-dark-600',
            dot: 'bg-dark-500',
        },
        closed: {
            bg: 'bg-dark-800',
            text: 'text-dark-300',
            border: 'border-dark-600',
            dot: 'bg-dark-400',
        },
        results_out: {
            bg: 'bg-success-subtle',
            text: 'text-success-light',
            border: 'border-success-border',
            dot: 'bg-success',
        },
    }

    return map[status] ?? map['draft']!
}