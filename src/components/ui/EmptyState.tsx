import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: ReactNode
    variant?: 'default' | 'compact'
    className?: string
}

/**
 * Premium empty state component with icon, text, and optional action.
 * Used in tables, lists, and filtered views.
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    variant = 'default',
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                'flex flex-col items-center justify-center text-center',
                variant === 'default' ? 'py-16 px-6' : 'py-8 px-4',
                className
            )}
        >
            <div className="mb-5 text-dark-500">
                {icon || <Inbox size={48} strokeWidth={1.5} />}
            </div>

            <h3
                className={cn(
                    'text-dark-200 font-medium',
                    variant === 'default' ? 'text-h6' : 'text-body-sm'
                )}
            >
                {title}
            </h3>

            {description && (
                <p
                    className={cn(
                        'text-dark-400 mt-1.5 max-w-md',
                        variant === 'default' ? 'text-body-sm' : 'text-caption'
                    )}
                >
                    {description}
                </p>
            )}

            {action && <div className="mt-6">{action}</div>}
        </motion.div>
    )
}