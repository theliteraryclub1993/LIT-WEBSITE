import { cn } from '@/utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface AvatarProps {
    src?: string | null
    alt?: string
    name?: string
    size?: AvatarSize
    rounded?: boolean
    bordered?: boolean
    className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
}

const borderStyles: Record<AvatarSize, string> = {
    xs: 'ring-1',
    sm: 'ring-1.5',
    md: 'ring-2',
    lg: 'ring-2',
    xl: 'ring-2',
    '2xl': 'ring-2',
}

/**
 * Get initials from a name string.
 */
function getInitials(name: string): string {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()

    return (
        parts[0]!.charAt(0).toUpperCase() +
        parts[parts.length - 1]!.charAt(0).toUpperCase()
    )
}

/**
 * Avatar with image fallback to initials, multiple sizes, and optional border.
 */
export function Avatar({
    src,
    alt = '',
    name,
    size = 'md',
    rounded = false,
    bordered = false,
    className,
}: AvatarProps) {
    const initials = name ? getInitials(name) : '?'

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center shrink-0 overflow-hidden',
                'bg-dark-700 text-dark-200 font-semibold',
                rounded ? 'rounded-full' : 'rounded-lg',
                sizeStyles[size],
                bordered && [
                    borderStyles[size],
                    'ring-dark-600 ring-offset-1 ring-offset-black',
                ],
                className
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        // Hide broken image and show initials instead
                        ; (e.target as HTMLImageElement).style.display = 'none'
                            ; (
                                e.target as HTMLImageElement
                            ).parentElement!.dataset.fallback = 'true'
                    }}
                />
            ) : (
                <span aria-hidden="true" className="select-none">
                    {initials}
                </span>
            )}
        </div>
    )
}

/**
 * Avatar group with overlapping avatars.
 */
interface AvatarGroupProps {
    avatars: Array<{ src?: string | null; name?: string; alt?: string }>
    size?: AvatarSize
    max?: number
    className?: string
}

export function AvatarGroup({
    avatars,
    size = 'md',
    max = 5,
    className,
}: AvatarGroupProps) {
    const visible = avatars.slice(0, max)
    const remaining = avatars.length - max

    return (
        <div className={cn('flex -space-x-2', className)}>
            {visible.map((avatar, index) => (
                <div key={index} className="ring-2 ring-dark-900 rounded-full">
                    <Avatar
                        src={avatar.src}
                        name={avatar.name}
                        alt={avatar.alt}
                        size={size}
                        rounded
                    />
                </div>
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        'relative inline-flex items-center justify-center rounded-full',
                        'bg-dark-700 text-dark-300 font-medium border-2 border-dark-900',
                        sizeStyles[size]
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    )
}