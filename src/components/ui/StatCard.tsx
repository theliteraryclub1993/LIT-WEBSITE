import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
    label: string
    value: string | number
    icon?: ReactNode
    change?: number
    changeLabel?: string
    variant?: 'default' | 'orange' | 'silver'
    className?: string
}

const variantStyles = {
    default: 'border-dark-700',
    orange: 'border-orange-border bg-gradient-to-br from-orange-subtle to-transparent',
    silver: 'border-silver-border bg-gradient-to-br from-silver-subtle to-transparent',
}

/**
 * Premium stat card for dashboards with trend indicator and icon.
 * Editorial Nike/TED style: big number, small label.
 */
export function StatCard({
    label,
    value,
    icon,
    change,
    changeLabel,
    variant = 'default',
    className,
}: StatCardProps) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0
    const isNeutral = change === undefined || change === 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                'relative p-5 rounded-xl border bg-dark-900 overflow-hidden',
                variantStyles[variant],
                className
            )}
        >
            {/* Decorative corner accent */}
            {variant === 'orange' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-primary/10 to-transparent rounded-bl-full" />
            )}

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-label text-dark-400 uppercase">{label}</p>

                    <p className="text-h3 text-white tabular-nums truncate">
                        {value}
                    </p>

                    {change !== undefined && (
                        <div className="flex items-center gap-1.5">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-0.5 text-caption font-semibold',
                                    isPositive && 'text-success-light',
                                    isNegative && 'text-error-light',
                                    isNeutral && 'text-dark-400'
                                )}
                            >
                                {isPositive && <TrendingUp size={12} />}
                                {isNegative && <TrendingDown size={12} />}
                                {isNeutral && <Minus size={12} />}
                                {isPositive ? '+' : ''}
                                {change}%
                            </span>

                            {changeLabel && (
                                <span className="text-caption text-dark-500">
                                    {changeLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {icon && (
                    <div
                        className={cn(
                            'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                            variant === 'orange'
                                ? 'bg-orange-primary/10 text-orange-primary'
                                : variant === 'silver'
                                    ? 'bg-silver-subtle text-silver-light'
                                    : 'bg-dark-800 text-dark-300'
                        )}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

/**
 * Compact stat for inline display.
 */
interface StatMiniProps {
    label: string
    value: string | number
    className?: string
}

export function StatMini({ label, value, className }: StatMiniProps) {
    return (
        <div className={cn('flex items-baseline gap-2', className)}>
            <span className="text-h4 text-white tabular-nums">{value}</span>
            <span className="text-caption text-dark-400 uppercase tracking-widest">
                {label}
            </span>
        </div>
    )
}