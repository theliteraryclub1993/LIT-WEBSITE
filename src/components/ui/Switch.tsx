import { cn } from '@/utils/cn'

interface SwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    description?: string
    disabled?: boolean
    size?: 'sm' | 'md'
    className?: string
}

const trackSizes = {
    sm: 'w-8 h-4.5',
    md: 'w-11 h-6',
}

const thumbSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
}

const thumbTranslate = {
    sm: 'translate-x-3.5',
    md: 'translate-x-5',
}

/**
 * Toggle switch with label and description.
 */
export function Switch({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    className,
}: SwitchProps) {
    return (
        <div
            className={cn(
                'inline-flex items-start gap-3',
                disabled && 'opacity-40',
                className
            )}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-out cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                    trackSizes[size],
                    checked ? 'bg-orange-primary' : 'bg-dark-600'
                )}
            >
                <span
                    className={cn(
                        'inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
                        thumbSizes[size],
                        checked ? thumbTranslate[size] : 'translate-x-0.5'
                    )}
                />
            </button>

            {(label || description) && (
                <div
                    className="flex flex-col cursor-pointer select-none"
                    onClick={() => !disabled && onChange(!checked)}
                >
                    {label && (
                        <span className="text-body-sm text-white font-medium">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-caption text-dark-400">{description}</span>
                    )}
                </div>
            )}
        </div>
    )
}