import { useEffect, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    subtitle?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    children: ReactNode
    showClose?: boolean
    closeOnOverlay?: boolean
    closeOnEsc?: boolean
    className?: string
}

const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
}

const contentMaxHeight = {
    sm: 'max-h-[70vh]',
    md: 'max-h-[75vh]',
    lg: 'max-h-[80vh]',
    xl: 'max-h-[85vh]',
    full: 'max-h-[90vh]',
}

/**
 * Premium modal with backdrop blur, smooth animations, and keyboard support.
 */
export function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    size = 'md',
    children,
    showClose = true,
    closeOnOverlay = true,
    closeOnEsc = true,
    className,
}: ModalProps) {
    const handleEsc = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEsc) {
                onClose()
            }
        },
        [closeOnEsc, onClose]
    )

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleEsc])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={closeOnOverlay ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Modal panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                        className={cn(
                            'relative w-full bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl',
                            'flex flex-col',
                            sizeStyles[size],
                            contentMaxHeight[size],
                            className
                        )}
                    >
                        {/* Header */}
                        {(title || showClose) && (
                            <div className="flex items-start justify-between p-6 pb-0 shrink-0">
                                <div className="space-y-1 pr-8">
                                    {title && (
                                        <h2
                                            id="modal-title"
                                            className="text-h5 text-white"
                                        >
                                            {title}
                                        </h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-body-sm text-dark-300">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>

                                {showClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors duration-150 shrink-0"
                                        aria-label="Close modal"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-6 overflow-y-auto scrollbar-hide">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}