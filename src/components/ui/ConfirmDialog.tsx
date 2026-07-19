import { Modal } from './Modal'
import { Button } from './Button'
import type { ConfirmDialogProps } from '@/types'
import { cn } from '@/utils/cn'
import { AlertTriangle, Trash2 } from 'lucide-react'

const variantStyles = {
    danger: {
        icon: <Trash2 size={24} className="text-error" />,
        confirmButton: 'danger' as const,
        ring: 'ring-error/20',
    },
    warning: {
        icon: <AlertTriangle size={24} className="text-warning" />,
        confirmButton: 'secondary' as const,
        ring: 'ring-warning/20',
    },
    default: {
        icon: null,
        confirmButton: 'primary' as const,
        ring: 'ring-dark-500',
    },
}

/**
 * Confirmation dialog with danger/warning variants and loading state.
 * Built on top of Modal and Button components.
 */
export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmDialogProps) {
    const styles = variantStyles[variant]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            size="sm"
            closeOnOverlay={!isLoading}
            closeOnEsc={!isLoading}
        >
            <div className="flex flex-col items-center text-center pt-2">
                {styles.icon && (
                    <div
                        className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center mb-4 ring-4',
                            styles.ring,
                            variant === 'danger' ? 'bg-error/10' : 'bg-warning/10'
                        )}
                    >
                        {styles.icon}
                    </div>
                )}

                <p className="text-body-sm text-dark-300 leading-relaxed mb-8">
                    {message}
                </p>

                <div className="flex items-center gap-3 w-full">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        variant={styles.confirmButton}
                        fullWidth
                        onClick={onConfirm}
                        isLoading={isLoading}
                        leftIcon={isLoading ? undefined : styles.icon}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}