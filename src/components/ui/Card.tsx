import type { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

/**
 * Card variant presets.
 */
type CardVariant = 'default' | 'glass' | 'bordered' | 'elevated' | 'orange-accent' | 'silver-accent'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    children: ReactNode
}

const variantStyles: Record<CardVariant, string> = {
    default: 'bg-dark-900 border border-dark-700',
    glass: 'glass-dark',
    bordered: 'bg-dark-950 border border-dark-600',
    elevated: 'bg-dark-900 border border-dark-700 shadow-lg',
    'orange-accent': 'bg-dark-900 border border-orange-border',
    'silver-accent': 'bg-dark-900 border border-silver-border',
}

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
}

/**
 * Premium card container with glass morphism and accent variants.
 */
export function Card({
    variant = 'default',
    hover = false,
    padding = 'md',
    className,
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl overflow-hidden',
                variantStyles[variant],
                paddingStyles[padding],
                hover && 'hover-lift hover:border-dark-500 transition-all duration-300',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Card header section.
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    noPadding?: boolean
}

export function CardHeader({
    children,
    noPadding = false,
    className,
    ...props
}: CardHeaderProps) {
    return (
        <div
            className={cn(
                !noPadding && 'pb-4 mb-4 border-b border-dark-700',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Card body/content section.
 */
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
    return (
        <div className={cn('space-y-3', className)} {...props}>
            {children}
        </div>
    )
}

/**
 * Card footer section.
 */
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
    return (
        <div
            className={cn('pt-4 mt-4 border-t border-dark-700 flex items-center gap-3', className)}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Card with image at the top.
 */
interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt: string
    aspectRatio?: 'video' | 'portrait' | 'square'
    overlay?: boolean
    children?: ReactNode
}

export function CardImage({
    src,
    alt,
    aspectRatio = 'video',
    overlay = false,
    children,
    className,
    ...props
}: CardImageProps) {
    const aspectClass = {
        video: 'aspect-video',
        portrait: 'aspect-portrait',
        square: 'aspect-square',
    }[aspectRatio]

    return (
        <div
            className={cn('relative overflow-hidden bg-dark-800', aspectClass, className)}
            {...props}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            />
            {overlay && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            )}
            {children && (
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                    {children}
                </div>
            )}
        </div>
    )
}