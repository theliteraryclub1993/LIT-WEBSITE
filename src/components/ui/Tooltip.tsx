import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface TooltipProps {
    content: string
    children: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
    className?: string
}

const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-dark-600 border-x-transparent border-b-transparent border-4',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-dark-600 border-x-transparent border-t-transparent border-4',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-dark-600 border-y-transparent border-r-transparent border-4',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-dark-600 border-y-transparent border-l-transparent border-4',
}

/**
 * Simple tooltip on hover.
 */
export function Tooltip({
    content,
    children,
    position = 'top',
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute z-50 px-2.5 py-1.5 rounded-md',
                            'bg-dark-600 text-white text-caption whitespace-nowrap',
                            'pointer-events-none shadow-lg',
                            positionStyles[position],
                            className
                        )}
                        role="tooltip"
                    >
                        {content}
                        <div className={cn('absolute', arrowStyles[position])} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}