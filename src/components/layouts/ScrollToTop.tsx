import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position to top on route change.
 * Place inside Router in main.tsx or inside Layout components.
 */
export function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }, [pathname])

    return null
}