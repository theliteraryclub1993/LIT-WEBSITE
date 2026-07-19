import { cn } from '@/utils/cn'

interface DividerProps {
    label?: string
    orientation?: 'horizontal' | 'vertical'
    variant?: 'solid' | 'dashed' | 'orange' | 'silver'
    className?: string
}

const variantStyles = {
    solid: 'border-dark-700',
    dashed: 'border-dark-600 border-dashed',
    orange: 'border-orange-primary/30',
    silver: 'border-silver-dark/30',
}

/**
 * Divider with optional centered label.
 */
export function Divider({
    label,
    orientation = 'horizontal',
    variant = 'solid',
    className,
}: DividerProps) {
    if (orientation === 'vertical') {
        return (
            <div
                className={cn(
                    'inline-block h-full min-h-[24px] border-l',
                    variantStyles[variant],
                    className
                )}
                role="separator"
                aria-orientation="vertical"
            />
        )
    }

    if (!label) {
        return (
            <hr
                className={cn('border-t', variantStyles[variant], className)}
                role="separator"
            />
        )
    }

    return (
        <div
            className={cn('flex items-center gap-4', className)}
            role="separator"
        >
            <div className={cn('flex-1 border-t', variantStyles[variant])} />
            <span className="text-caption text-dark-500 uppercase tracking-widest whitespace-nowrap">
                {label}
            </span>
            <div className={cn('flex-1 border-t', variantStyles[variant])} />
        </div>
    )
}