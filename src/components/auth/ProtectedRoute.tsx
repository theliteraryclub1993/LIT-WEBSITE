import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { PageLoader } from '@/components/ui'

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * Route guard that ensures the user is authenticated.
 * Shows a full-page loader while checking auth state.
 * Redirects to /login if not authenticated, preserving the intended destination.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const isLoading = useAuthStore((s) => s.isLoading)
    const location = useLocation()

    // Still initializing auth state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <PageLoader label="Verifying access..." />
            </div>
        )
    }

    // Not authenticated — redirect to login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname + location.search }}
                replace
            />
        )
    }

    // Authenticated — render children
    return <>{children}</>
}