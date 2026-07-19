import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Input size presets.
 */
type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string
    hint?: string
    error?: string
    size?: InputSize
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    fullWidth?: boolean
}

const sizeStyles: Record<InputSize, string> = {
    sm: 'text-body-sm px-3 py-1.5 rounded-md',
    md: 'text-body px-3.5 py-2.5 rounded-lg',
    lg: 'text-body-lg px-4 py-3 rounded-lg',
}

/**
 * Premium dark-themed input with label, hint, error, and icon slots.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            hint,
            error,
            size = 'md',
            leftIcon,
            rightIcon,
            fullWidth = true,
            id,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-label text-dark-200 block"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none">
                            {leftIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={cn(
                            'w-full bg-dark-800 border text-white placeholder-dark-400',
                            'transition-all duration-200 ease-out',
                            'focus:outline-none focus:ring-2 focus:ring-orange-primary/50 focus:border-orange-primary',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                            sizeStyles[size],
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error
                                ? 'border-error focus:ring-error/50 focus:border-error'
                                : 'border-dark-600 hover:border-dark-500',
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                            {rightIcon}
                        </span>
                    )}
                </div>

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
        )
    }
)

Input.displayName = 'Input'