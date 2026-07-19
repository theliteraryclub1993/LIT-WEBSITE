/**
 * User role values matching the PostgreSQL enum.
 */
export type UserRole = 'superAdmin' | 'admin' | 'eventManager' | 'contentEditor'

/**
 * Role hierarchy — higher number = more permissions.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superAdmin: 4,
  admin: 3,
  eventManager: 2,
  contentEditor: 1,
} as const

/**
 * Profile entity linked to auth.users.
 */
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  bio: string | null
  created_at: string
  updated_at: string
}

/**
 * Payload for updating a profile.
 */
export type ProfileUpdateInput = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>

/**
 * Profile form values.
 */
export interface ProfileFormValues {
  full_name: string
  avatar_url: string
  phone: string
  bio: string
}

/**
 * Login form values.
 */
export interface LoginFormValues {
  email: string
  password: string
}

/**
 * Extended user session data merged with profile.
 */
export interface AuthUser {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  created_at: string
}

/**
 * Permission map for each role.
 * Defines what each role can and cannot do.
 */
export interface RolePermissions {
  canManageUsers: boolean
  canManageEvents: boolean
  canManageParticipants: boolean
  canManageAuditions: boolean
  canManageTeam: boolean
  canManageBlog: boolean
  canManageGallery: boolean
  canManageAttendance: boolean
  canManageCertificates: boolean
  canViewAnalytics: boolean
  canManageSettings: boolean
  canDeleteContent: boolean
  canViewLogs: boolean
}

/**
 * Permission definitions per role.
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  superAdmin: {
    canManageUsers: true,
    canManageEvents: true,
    canManageParticipants: true,
    canManageAuditions: true,
    canManageTeam: true,
    canManageBlog: true,
    canManageGallery: true,
    canManageAttendance: true,
    canManageCertificates: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canDeleteContent: true,
    canViewLogs: true,
  },
  admin: {
    canManageUsers: false,
    canManageEvents: true,
    canManageParticipants: true,
    canManageAuditions: true,
    canManageTeam: true,
    canManageBlog: true,
    canManageGallery: true,
    canManageAttendance: true,
    canManageCertificates: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canDeleteContent: false,
    canViewLogs: true,
  },
  eventManager: {
    canManageUsers: false,
    canManageEvents: true,
    canManageParticipants: true,
    canManageAuditions: true,
    canManageTeam: false,
    canManageBlog: false,
    canManageGallery: false,
    canManageAttendance: true,
    canManageCertificates: true,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteContent: false,
    canViewLogs: false,
  },
  contentEditor: {
    canManageUsers: false,
    canManageEvents: false,
    canManageParticipants: false,
    canManageAuditions: false,
    canManageTeam: true,
    canManageBlog: true,
    canManageGallery: true,
    canManageAttendance: false,
    canManageCertificates: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteContent: false,
    canViewLogs: false,
  },
} as const

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

/**
 * Check if a role has permission level >= required role.
 */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}
