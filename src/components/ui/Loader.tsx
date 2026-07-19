import { cn } from '@/utils/cn'

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

interface LoaderProps {
    size?: LoaderSize
    variant?: LoaderVariant
    color?: 'orange' | 'silver' | 'white'
    className?: string
    label?: string
}

const sizeMap: Record<LoaderSize, string> = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
}

const colorMap: Record<string, string> = {
    orange: 'text-orange-primary',
    silver: 'text-silver-primary',
    white: 'text-white',
}

const dotSizeMap: Record<LoaderSize, string> = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
}

const barSizeMap: Record<LoaderSize, string> = {
    xs: 'w-0.5 h-3',
    sm: 'w-0.5 h-4',
    md: 'w-1 h-5',
    lg: 'w-1 h-7',
    xl: 'w-1.5 h-9',
}

/**
 * Versatile loading indicator with 4 variants.
 */
export function Loader({
    size = 'md',
    variant = 'spinner',
    color = 'orange',
    className,
    label,
}: LoaderProps) {
    const colorClass = colorMap[color]

    if (variant === 'dots') {
        return (
            <div className={cn('flex items-center justify-center gap-1.5', className)}>
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={cn(
                            'rounded-full bg-current animate-bounce',
                            dotSizeMap[size],
                            colorClass
                        )}
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </div>
        )
    }

    if (variant === 'pulse') {
        return (
            <div className={cn('relative', sizeMap[size], className)}>
                <span
                    className={cn(
                        'absolute inset-0 rounded-full bg-current opacity-30 animate-ping',
                        colorClass
                    )}
                />
                <span
                    className={cn(
                        'relative block w-full h-full rounded-full bg-current',
                        colorClass
                    )}
                />
            </div>
        )
    }

    if (variant === 'bars') {
        return (
            <div className={cn('flex items-center justify-center gap-1', className)}>
                {[0, 1, 2, 3].map((i) => (
                    <span
                        key={i}
                        className={cn(
                            'rounded-full bg-current',
                            barSizeMap[size],
                            colorClass
                        )}
                        style={{
                            animation: `pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                            animationDelay: `${i * 100}ms`,
                        }}
                    />
                ))}
            </div>
        )
    }

    // Default: spinner
    return (
        <div
            className={cn('flex flex-col items-center justify-center gap-3', className)}
        >
            <svg
                className={cn('animate-spin', sizeMap[size], colorClass)}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            {label && (
                <p className="text-caption text-dark-400">{label}</p>
            )}
        </div>
    )
}

/**
 * Full-page loader for routes and sections.
 */
export function PageLoader({ label = 'Loading...' }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader size="lg" variant="spinner" color="orange" />
            <p className="text-body-sm text-dark-400 animate-pulse">{label}</p>
        </div>
    )
}

/**
 * Inline loader for buttons and small sections.
 */
export function InlineLoader({ size = 'sm' }: { size?: LoaderSize }) {
    return <Loader size={size} variant="dots" color="orange" />
}