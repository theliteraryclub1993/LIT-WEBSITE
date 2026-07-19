import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant =
    | 'default'
    | 'orange'
    | 'silver'
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'outline'

type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
    size?: BadgeSize
    dot?: boolean
    children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-dark-700 text-dark-200 border-dark-600',
    orange: 'bg-orange-subtle text-orange-light border-orange-border',
    silver: 'bg-silver-subtle text-silver-light border-silver-border',
    success: 'bg-success-subtle text-success-light border-success-border',
    error: 'bg-error-subtle text-error-light border-error-border',
    warning: 'bg-warning-subtle text-warning-light border-warning-border',
    info: 'bg-info-subtle text-info-light border-info-border',
    outline: 'bg-transparent text-dark-200 border-dark-500',
}

const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-dark-400',
    orange: 'bg-orange-primary',
    silver: 'bg-silver-primary',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-info',
    outline: 'bg-dark-400',
}

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-caption px-2.5 py-0.5 gap-1.5',
}

/**
 * Status badge with dot indicator and color variants.
 */
export function Badge({
    variant = 'default',
    size = 'md',
    dot = false,
    children,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center font-body font-medium rounded-md border',
                'whitespace-nowrap select-none',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span
                    className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        dotColors[variant]
                    )}
                />
            )}
            {children}
        </span>
    )
}