import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    hint?: string
    error?: string
    fullWidth?: boolean
    showCount?: boolean
    maxLength?: number
    currentLength?: number
}

/**
 * Premium dark-themed textarea with label, hint, error, and character count.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            hint,
            error,
            fullWidth = true,
            showCount = false,
            maxLength,
            currentLength = 0,
            id,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="text-label text-dark-200 block"
                    >
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    disabled={disabled}
                    maxLength={maxLength}
                    className={cn(
                        'w-full bg-dark-800 border text-white placeholder-dark-400',
                        'text-body px-3.5 py-2.5 rounded-lg',
                        'transition-all duration-200 ease-out',
                        'focus:outline-none focus:ring-2 focus:ring-orange-primary/50 focus:border-orange-primary',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        'resize-y min-h-[100px]',
                        error
                            ? 'border-error focus:ring-error/50 focus:border-error'
                            : 'border-dark-600 hover:border-dark-500',
                        className
                    )}
                    {...props}
                />

                <div className="flex items-center justify-between">
                    <div>
                        {hint && !error && (
                            <p className="text-caption text-dark-400">{hint}</p>
                        )}
                        {error && (
                            <p className="text-caption text-error-light flex items-center gap-1">
                                <span className="inline-block w-1 h-1 rounded-full bg-error-light" />
                                {error}
                            </p>
                        )}
                    </div>

                    {showCount && maxLength && (
                        <p
                            className={cn(
                                'text-caption tabular-nums',
                                currentLength > maxLength * 0.9
                                    ? 'text-error-light'
                                    : 'text-dark-400'
                            )}
                        >
                            {currentLength}/{maxLength}
                        </p>
                    )}
                </div>
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'