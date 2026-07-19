import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { PageLoader } from '@/components/ui'

/**
 * Route element wrapper that combines ProtectedRoute logic for React Router `<Route element={...}>` pattern.
 * Usage: <Route path="/admin" element={<RequireAuth />}><Route ... /></Route>
 */
export function RequireAuth() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const isLoading = useAuthStore((s) => s.isLoading)
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <PageLoader label="Verifying access..." />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname + location.search }}
                replace
            />
        )
    }

    return <Outlet />
}