import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { SelectOption } from '@/types'

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string
    hint?: string
    error?: string
    options: SelectOption[]
    placeholder?: string
    fullWidth?: boolean
    size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
    sm: 'text-body-sm px-3 py-1.5 rounded-md',
    md: 'text-body px-3.5 py-2.5 rounded-lg',
    lg: 'text-body-lg px-4 py-3 rounded-lg',
}

/**
 * Premium dark-themed select dropdown with grouped options support.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            hint,
            error,
            options,
            placeholder = 'Select an option',
            fullWidth = true,
            size = 'md',
            id,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

        // Group options by group property
        const groups = options.reduce<
            Record<string, SelectOption[]>
        >((acc, option) => {
            const group = option.group || ''
            if (!acc[group]) acc[group] = []
            acc[group]!.push(option)
            return acc
        }, {})

        const hasGroups = Object.keys(groups).some(Boolean)

        return (
            <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-label text-dark-200 block"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        className={cn(
                            'w-full bg-dark-800 border text-white appearance-none',
                            'transition-all duration-200 ease-out',
                            'focus:outline-none focus:ring-2 focus:ring-orange-primary/50 focus:border-orange-primary',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                            'pr-10 cursor-pointer',
                            sizeStyles[size],
                            error
                                ? 'border-error focus:ring-error/50 focus:border-error'
                                : 'border-dark-600 hover:border-dark-500',
                            className
                        )}
                        {...props}
                    >
                        <option value="" disabled>
                            {placeholder}
                        </option>

                        {hasGroups ? (
                            Object.entries(groups).map(([group, groupOptions]) => (
                                <optgroup
                                    key={group || '_default'}
                                    label={group || undefined}
                                    className="bg-dark-800 text-dark-200"
                                >
                                    {groupOptions!.map((option) => (
                                        <option
                                            key={String(option.value)}
                                            value={String(option.value)}
                                            disabled={option.disabled}
                                            className="bg-dark-800 text-white"
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))
                        ) : (
                            (groups[''] ?? []).map((option) => (
                                <option
                                    key={String(option.value)}
                                    value={String(option.value)}
                                    disabled={option.disabled}
                                    className="bg-dark-800 text-white"
                                >
                                    {option.label}
                                </option>
                            ))
                        )}
                    </select>

                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none"
                    />
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

Select.displayName = 'Select'