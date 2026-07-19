import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types'

interface BreadcrumbsProps {
    items: BreadcrumbItemType[]
    className?: string
}

/**
 * Editorial breadcrumb navigation.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
            <ol className="flex items-center gap-1.5 text-body-sm">
                <li>
                    <Link
                        to="/"
                        className="text-dark-400 hover:text-white transition-colors duration-150 flex items-center gap-1"
                    >
                        <Home size={14} />
                        <span className="hidden sm:inline">Home</span>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <li key={index} className="flex items-center gap-1.5">
                            <ChevronRight size={12} className="text-dark-600 shrink-0" />

                            {isLast || !item.href ? (
                                <span
                                    className={cn(
                                        'truncate max-w-[200px]',
                                        isLast ? 'text-white font-medium' : 'text-dark-400'
                                    )}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="text-dark-400 hover:text-white transition-colors duration-150 truncate max-w-[200px]"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}