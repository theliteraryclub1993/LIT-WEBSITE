import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { TabItem } from '@/types'

interface TabsProps {
    items: TabItem[]
    defaultTab?: string
    onChange?: (tabId: string) => void
    variant?: 'underline' | 'pill' | 'segmented'
    size?: 'sm' | 'md'
    fullWidth?: boolean
    className?: string
}

const variantContainerStyles = {
    underline: 'border-b border-dark-700 gap-0',
    pill: 'gap-1 bg-dark-800/50 p-1 rounded-lg',
    segmented: 'bg-dark-800 p-1 rounded-lg',
}

const variantTabStyles = {
    underline: {
        base: 'pb-3 px-4 border-b-2 border-transparent',
        active: 'border-orange-primary text-white',
        inactive: 'text-dark-400 hover:text-dark-200',
    },
    pill: {
        base: 'px-4 py-1.5 rounded-md',
        active: 'bg-dark-700 text-white',
        inactive: 'text-dark-400 hover:text-dark-200 hover:bg-dark-800',
    },
    segmented: {
        base: 'px-4 py-2 rounded-md flex-1 justify-center',
        active: 'bg-orange-primary text-black font-semibold',
        inactive: 'text-dark-400 hover:text-dark-200',
    },
}

const sizeStyles = {
    sm: 'text-caption',
    md: 'text-body-sm',
}

/**
 * Premium tab navigation with underline, pill, and segmented variants.
 */
export function Tabs({
    items,
    defaultTab,
    onChange,
    variant = 'underline',
    size = 'md',
    fullWidth = false,
    className,
}: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || '')

    const handleTabChange = (tabId: string) => {
        if (items.find((item) => item.id === tabId && !item.disabled)) {
            setActiveTab(tabId)
            onChange?.(tabId)
        }
    }

    // Find active tab content if any item has children
    const activeItem = items.find((item) => item.id === activeTab)

    return (
        <div className={cn('space-y-4', className)}>
            <div
                className={cn(
                    'flex items-center',
                    variantContainerStyles[variant],
                    fullWidth && variant !== 'underline' && 'w-full',
                    sizeStyles[size]
                )}
                role="tablist"
            >
                {items.map((item) => {
                    const isActive = item.id === activeTab
                    const isDisabled = item.disabled

                    if (variant === 'underline') {
                        return (
                            <button
                                key={item.id}
                                role="tab"
                                aria-selected={isActive}
                                disabled={isDisabled}
                                onClick={() => handleTabChange(item.id)}
                                className={cn(
                                    'relative font-medium transition-colors duration-200 whitespace-nowrap',
                                    variantTabStyles.underline.base,
                                    isActive
                                        ? variantTabStyles.underline.active
                                        : variantTabStyles.underline.inactive,
                                    isDisabled && 'opacity-40 cursor-not-allowed',
                                    'flex items-center gap-2'
                                )}
                            >
                                {item.icon && <span className="shrink-0">{item.icon}</span>}
                                {item.label}
                                {item.count !== undefined && (
                                    <span
                                        className={cn(
                                            'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                                            isActive
                                                ? 'bg-orange-primary/20 text-orange-light'
                                                : 'bg-dark-700 text-dark-400'
                                        )}
                                    >
                                        {item.count}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-primary"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        )
                    }

                    return (
                        <button
                            key={item.id}
                            role="tab"
                            aria-selected={isActive}
                            disabled={isDisabled}
                            onClick={() => handleTabChange(item.id)}
                            className={cn(
                                'inline-flex items-center justify-center font-medium transition-all duration-200 whitespace-nowrap',
                                variantTabStyles[variant].base,
                                isActive
                                    ? variantTabStyles[variant].active
                                    : variantTabStyles[variant].inactive,
                                isDisabled && 'opacity-40 cursor-not-allowed',
                                sizeStyles[size]
                            )}
                        >
                            {item.icon && <span className="shrink-0">{item.icon}</span>}
                            {item.label}
                            {item.count !== undefined && (
                                <span
                                    className={cn(
                                        'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                                        isActive
                                            ? variant === 'segmented'
                                                ? 'bg-black/20 text-black'
                                                : 'bg-orange-primary/20 text-orange-light'
                                            : 'bg-dark-600 text-dark-400'
                                    )}
                                >
                                    {item.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab content — render if item has children (ReactNode) */}
            {activeItem && 'children' in activeItem && (
                <div role="tabpanel" className="animate-fade-in">
                    {(activeItem as any).children}
                </div>
            )}
        </div>
    )
}