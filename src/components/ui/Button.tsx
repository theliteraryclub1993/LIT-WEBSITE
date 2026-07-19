import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

/**
 * Button variant presets.
 */
type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'orange-glow'
    | 'silver'
    | 'link'

/**
 * Button size presets.
 */
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps
    extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    fullWidth?: boolean
    children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-orange-primary text-black font-semibold hover:bg-orange-light active:bg-orange-dark border border-orange-primary',
    secondary:
        'bg-dark-800 text-white hover:bg-dark-700 active:bg-dark-600 border border-dark-600',
    outline:
        'bg-transparent text-white hover:bg-dark-800 active:bg-dark-700 border border-dark-500 hover:border-dark-400',
    ghost:
        'bg-transparent text-dark-200 hover:text-white hover:bg-dark-800/50 active:bg-dark-700/50 border border-transparent',
    danger:
        'bg-error/10 text-error-light hover:bg-error/20 active:bg-error/30 border border-error-border',
    success:
        'bg-success/10 text-success-light hover:bg-success/20 active:bg-success/30 border border-success-border',
    'orange-glow':
        'bg-orange-primary text-black font-semibold hover:bg-orange-light border border-orange-primary glow-orange hover:shadow-orange-lg',
    silver:
        'bg-dark-800 text-silver-light hover:bg-dark-700 border border-silver-border hover:border-silver-dark',
    link:
        'bg-transparent text-orange-primary hover:text-orange-light underline underline-offset-4 decoration-orange-primary/30 hover:decoration-orange-primary p-0 h-auto border-none',
}

const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-caption px-2.5 py-1 rounded-sm gap-1',
    sm: 'text-body-sm px-3.5 py-1.5 rounded-md gap-1.5',
    md: 'text-body-sm px-4 py-2 rounded-md gap-2',
    lg: 'text-body px-5 py-2.5 rounded-lg gap-2.5',
    xl: 'text-body-lg px-7 py-3.5 rounded-lg gap-3',
}

const loaderSizes: Record<ButtonSize, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
}

/**
 * Premium button component with variants, sizes, loading states, and icons.
 * Built on Framer Motion for hover/tap animations.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled,
            className,
            children,
            type = 'button',
            ...motionProps
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading

        return (
            <motion.button
                ref={ref}
                type={type}
                disabled={isDisabled}
                whileHover={isDisabled ? undefined : { scale: 1.02 }}
                whileTap={isDisabled ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={cn(
                    'inline-flex items-center justify-center font-body font-medium',
                    'transition-colors duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
                    'select-none whitespace-nowrap',
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...motionProps}
            >
                {isLoading ? (
                    <Loader2
                        size={loaderSizes[size]}
                        className="animate-spin shrink-0"
                    />
                ) : (
                    leftIcon && <span className="shrink-0">{leftIcon}</span>
                )}

                <span className="truncate">{children}</span>

                {!isLoading && rightIcon && (
                    <span className="shrink-0">{rightIcon}</span>
                )}
            </motion.button>
        )
    }
)

Button.displayName = 'Button'