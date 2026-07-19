import { useAuthStore } from '@/store'
import { hasMinRole, hasPermission, type UserRole } from '@/types'
import { EmptyState } from '@/components/ui'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

interface RoleGuardProps {
    /**
     * Minimum required role to access this route.
     * Uses the role hierarchy (superAdmin > admin > eventManager > contentEditor).
     */
    minRole?: UserRole

    /**
     * Specific permission required to access this route.
     * Checked against ROLE_PERMISSIONS map.
     */
    permission?: keyof import('@/types').RolePermissions

    /**
     * Array of allowed roles. If provided, user must have one of these exact roles.
     * Takes precedence over minRole if both are provided.
     */
    allowedRoles?: UserRole[]

    /**
     * Content to render if authorized.
     */
    children: React.ReactNode

    /**
     * Show a "back to dashboard" button in the unauthorized UI.
     */
    showBackButton?: boolean
}

/**
 * Component guard that checks user roles and permissions.
 * Renders an "Access Denied" UI if the user doesn't meet requirements.
 */
export function RoleGuard({
    minRole,
    permission,
    allowedRoles,
    children,
    showBackButton = true,
}: RoleGuardProps) {
    const user = useAuthStore((s) => s.user)
    const navigate = useNavigate()

    // No user at all (shouldn't happen if wrapped in ProtectedRoute, but safety check)
    if (!user) {
        return null
    }

    // Check allowed roles (exact match)
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            return <AccessDeniedUI showBackButton={showBackButton} navigate={navigate} />
        }
        return <>{children}</>
    }

    // Check specific permission
    if (permission) {
        if (!hasPermission(user.role, permission)) {
            return <AccessDeniedUI showBackButton={showBackButton} navigate={navigate} />
        }
        return <>{children}</>
    }

    // Check minimum role level
    if (minRole) {
        if (!hasMinRole(user.role, minRole)) {
            return <AccessDeniedUI showBackButton={showBackButton} navigate={navigate} />
        }
        return <>{children}</>
    }

    // No restrictions specified
    return <>{children}</>
}

/**
 * Internal component for the access denied state.
 */
function AccessDeniedUI({ showBackButton, navigate }: { showBackButton: boolean; navigate: (path: string) => void }) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <EmptyState
                icon={<ShieldX size={56} strokeWidth={1.5} className="text-error/60" />}
                title="Access Denied"
                description="You do not have the required permissions to view this page. Contact your administrator if you believe this is an error."
                variant="default"
                action={
                    showBackButton ? (
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin')}
                        >
                            Back to Dashboard
                        </Button>
                    ) : undefined
                }
            />
        </div>
    )
}