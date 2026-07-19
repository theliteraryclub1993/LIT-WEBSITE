/**
 * Social links attached to a team member.
 */
export interface SocialLinks {
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    behance?: string
    github?: string
    website?: string
    [key: string]: string | undefined
}

/**
 * Complete team member entity.
 */
export interface TeamMember {
    id: string
    user_id: string | null
    name: string
    role: string
    department: string | null
    avatar_url: string | null
    bio: string | null
    order_index: number
    is_active: boolean
    social_links: SocialLinks | null
    created_at: string
    updated_at: string
}

/**
 * Payload for creating a team member.
 */
export type TeamMemberCreateInput = Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>

/**
 * Payload for updating a team member.
 */
export type TeamMemberUpdateInput = Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>

/**
 * Team member as displayed in public listing.
 */
export interface TeamMemberPublic {
    id: string
    name: string
    role: string
    department: string | null
    avatar_url: string | null
    bio: string | null
    social_links: SocialLinks | null
}

/**
 * Team member grouped by department.
 */
export interface DepartmentGroup {
    department: string
    members: TeamMemberPublic[]
}

/**
 * Form values for creating/editing a team member.
 */
export interface TeamMemberFormValues {
    name: string
    role: string
    department: string
    avatar_url: string
    bio: string
    order_index: number
    is_active: boolean
    social_links: SocialLinks
}

/**
 * Filters for listing team members.
 */
export interface TeamMemberFilters {
    department?: string
    is_active?: boolean
    search?: string
}

/**
 * Team statistics.
 */
export interface TeamStats {
    total: number
    active: number
    inactive: number
    departments: Array<{ department: string; count: number }>
}